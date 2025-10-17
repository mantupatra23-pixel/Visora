#!/usr/bin/env python3
"""
Visora - Single-file Flask backend (production-like)

Usage:
  - pip install -r requirements.txt
  - set env vars for PAYPAL/RAZORPAY if needed
  - ensure ffmpeg available if you want movie rendering (moviepy)
  - run: python app.py
"""

import os
import uuid
import json
import shutil
import logging
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from queue import Queue, Empty

from flask import Flask, request, jsonify, url_for, send_from_directory, abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename

# ---------- Logging ----------
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("visora")

# ---------- Paths ----------
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
OUTPUT_FOLDER = BASE_DIR / "outputs"
TMP_FOLDER = BASE_DIR / "tmp"
for p in (UPLOAD_FOLDER, OUTPUT_FOLDER, TMP_FOLDER):
    p.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_EXT = {"png", "jpg", "jpeg", "gif", "webp"}
ALLOWED_AUDIO_EXT = {"mp3", "wav", "ogg", "m4a"}
ALLOWED_VIDEO_EXT = {"mp4", "mov", "mkv", "webm"}

# ---------- App config ----------
app = Flask("Visora")
app.config["SECRET_KEY"] = os.getenv("APP_SECRET_KEY", "visora-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", f"sqlite:///{str(BASE_DIR/'visora_data.db')}")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = str(UPLOAD_FOLDER)
app.config["OUTPUT_FOLDER"] = str(OUTPUT_FOLDER)
app.config["TMP_FOLDER"] = str(TMP_FOLDER)
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_UPLOAD_MB", 700)) * 1024 * 1024

db = SQLAlchemy(app)

# ---------- Optional imports ----------
MOVIEPY_AVAILABLE = False
GTTS_AVAILABLE = False
try:
    from moviepy.editor import ImageClip, concatenate_videoclips, AudioFileClip, CompositeAudioClip
    from moviepy.video.fx.all import resize
    MOVIEPY_AVAILABLE = True
except Exception as e:
    log.warning("moviepy unavailable: %s", e)

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except Exception as e:
    log.warning("gTTS unavailable: %s", e)

# Payment env (optional)
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = os.getenv("PAYPAL_SECRET")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com")

# ---------- DB Models ----------
class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(100))
    country = db.Column(db.String(100))
    photo = db.Column(db.String(1024))
    plan = db.Column(db.String(50), default="Free")
    credits = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserCharacter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(255))
    name = db.Column(db.String(100))
    photo_path = db.Column(db.String(1024))
    voice_path = db.Column(db.String(1024))
    ai_style = db.Column(db.String(50))
    mood = db.Column(db.String(50))
    is_locked = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserVideo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(255))
    title = db.Column(db.String(255))
    script = db.Column(db.Text)
    template = db.Column(db.String(255))
    voices = db.Column(db.String(1024))  # json list
    quality = db.Column(db.String(20))
    length_type = db.Column(db.String(20))
    background_music = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    file_path = db.Column(db.String(1024))
    status = db.Column(db.String(50), default="ready")
    meta_json = db.Column(db.Text)

class TemplateCatalog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    category = db.Column(db.String(100))
    thumbnail = db.Column(db.String(1024))
    trending_score = db.Column(db.Integer, default=0)

class VoiceOption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    display_name = db.Column(db.String(255))
    description = db.Column(db.String(512))

class Plan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    price = db.Column(db.String(50))
    features = db.Column(db.String(255))

# ---------- DB init defaults ----------
with app.app_context():
    db.create_all()
    if not VoiceOption.query.first():
        db.session.add_all([
            VoiceOption(display_name="Female", description="Soft female voice"),
            VoiceOption(display_name="Male", description="Deep male voice"),
            VoiceOption(display_name="Child", description="Child voice"),
            VoiceOption(display_name="Celebrity", description="Celebrity-like demo")
        ])
    if not TemplateCatalog.query.first():
        db.session.add_all([
            TemplateCatalog(name="Motivation", category="Inspiration"),
            TemplateCatalog(name="Promo", category="Marketing"),
            TemplateCatalog(name="Explainer", category="Education"),
            TemplateCatalog(name="Cinematic", category="Cinema")
        ])
    if not Plan.query.first():
        db.session.add_all([
            Plan(name="Free", price="0", features="Low quality, 1 render/day"),
            Plan(name="Premium", price="499", features="FullHD, 10 renders/day"),
            Plan(name="Pro", price="999", features="4K, unlimited renders")
        ])
    if not UserProfile.query.filter_by(email="demo@visora.com").first():
        db.session.add(UserProfile(email="demo@visora.com", name="Demo User", country="India", credits=5))
    db.session.commit()

# ---------- Helpers ----------
def allowed_file(filename: str, allowed_set: set) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_set

def save_upload(file_storage, subfolder: str = "") -> str:
    filename = secure_filename(file_storage.filename)
    ext = filename.rsplit(".", 1)[1].lower() if "." in filename else ""
    uid = uuid.uuid4().hex
    dest_name = f"{uid}.{ext}" if ext else uid
    folder = Path(app.config["UPLOAD_FOLDER"]) / subfolder
    folder.mkdir(parents=True, exist_ok=True)
    dest = folder / dest_name
    file_storage.save(dest)
    rel = str(dest.relative_to(BASE_DIR))
    log.info("Saved upload: %s", rel)
    return rel

def _abs_path(rel_or_abs: str) -> str:
    p = Path(rel_or_abs)
    if not p.is_absolute():
        p = BASE_DIR / rel_or_abs
    return str(p.resolve())

# ---------- Movie helpers (lip-sync like) ----------
def create_lip_sync_like_clip(image_path: str, duration: float, size_width: int = 1280):
    if not MOVIEPY_AVAILABLE:
        raise RuntimeError("MoviePy not available")
    abs_img = _abs_path(image_path)
    base = ImageClip(abs_img).set_duration(duration).resize(width=size_width)
    small = base.fx(resize, 0.98)
    seg = 0.12
    clips = []
    t = 0.0
    toggle = False
    while t < duration - 1e-6:
        seg_d = min(seg, duration - t)
        clip = small.set_duration(seg_d) if toggle else base.set_duration(seg_d)
        clips.append(clip)
        toggle = not toggle
        t += seg_d
    from moviepy.editor import concatenate_videoclips
    return concatenate_videoclips(clips, method="compose")

def render_video_multi_characters(image_rel_paths: List[str], audio_rel_paths: List[str], output_abs_path: str, quality: str = "HD", bg_music_rel: Optional[str] = None):
    if not MOVIEPY_AVAILABLE:
        raise RuntimeError("MoviePy not available")
    clips = []
    audios = []
    n = min(len(image_rel_paths), len(audio_rel_paths))
    if n == 0:
        raise ValueError("No images or audios provided")
    for i in range(n):
        img = image_rel_paths[i]
        aud = audio_rel_paths[i]
        audio_abs = _abs_path(aud)
        audio_clip = AudioFileClip(audio_abs)
        audios.append(audio_clip)
        dur = audio_clip.duration if audio_clip.duration > 0.1 else 2.0
        clip = create_lip_sync_like_clip(img, dur)
        clip = clip.set_audio(audio_clip)
        clips.append(clip)
    final_video = concatenate_videoclips(clips, method="compose")
    if bg_music_rel:
        try:
            bg_abs = _abs_path(bg_music_rel)
            bg_clip = AudioFileClip(bg_abs)
            if bg_clip.duration < final_video.duration:
                from moviepy.editor import concatenate_audioclips
                n_loops = int(final_video.duration / bg_clip.duration) + 1
                bg_parts = [bg_clip] * n_loops
                bg_clip = concatenate_audioclips(bg_parts).subclip(0, final_video.duration)
            else:
                bg_clip = bg_clip.subclip(0, final_video.duration)
            bg_clip = bg_clip.volumex(0.12)
            final_audio = CompositeAudioClip([final_video.audio, bg_clip])
            final_video = final_video.set_audio(final_audio)
        except Exception as e:
            log.exception("Failed to load bg music: %s", e)
    bitrate = "2500k" if quality and quality.lower() in ("fullhd","full hd","1080","1080p") else ("8000k" if quality and quality.lower() in ("4k","2160") else "800k")
    final_video.write_videofile(output_abs_path, fps=24, codec="libx264", audio_codec="aac", bitrate=bitrate)
    final_video.close()
    for a in audios:
        try: a.close()
        except: pass

# ---------- Background render queue ----------
render_queue: "Queue[Dict[str,Any]]" = Queue()
render_jobs: Dict[str, Dict[str,Any]] = {}

def render_worker():
    while True:
        try:
            job = render_queue.get(timeout=1)
        except Empty:
            time.sleep(0.5)
            continue
        job_id = job.get("job_id")
        log.info("Worker picked job %s", job_id)
        try:
            image_rel_paths = job["images"]
            audio_rel_paths = job["audios"]
            bg_rel = job.get("bg")
            out_abs = job["out_abs"]
            quality = job.get("quality","HD")
            render_video_multi_characters(image_rel_paths, audio_rel_paths, out_abs, quality=quality, bg_music_rel=bg_rel)
            render_jobs[job_id]["status"] = "done"
            render_jobs[job_id]["output_file"] = str(Path(out_abs).relative_to(BASE_DIR))
            log.info("Job %s done -> %s", job_id, out_abs)
        except Exception as e:
            log.exception("Render job failed %s", e)
            render_jobs[job_id]["status"] = "failed"
            render_jobs[job_id]["error"] = str(e)
        finally:
            render_queue.task_done()

worker_thread = threading.Thread(target=render_worker, daemon=True)
worker_thread.start()

# ---------- Small assistant ----------
def assistant_generate(query: str, tone: str = "helpful") -> str:
    base = f"Suggestion: Make the opening line punchy and add a short CTA. You asked: {query}"
    if tone == "funny":
        return f"Okay funny mode 😂 — Start with 'Guess what...' and add a one-line CTA. You asked: {query}"
    if tone == "friendly":
        return f"Hi! Try a friendly start: 'Hey, I found this...' — You said: {query}"
    return base

# ---------- Routes ----------
@app.route("/", methods=["GET"])
def index():
    return jsonify({"app": "Visora", "status": "ok"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":"ok",
        "moviepy": MOVIEPY_AVAILABLE,
        "gtts": GTTS_AVAILABLE,
        "db": app.config["SQLALCHEMY_DATABASE_URI"]
    })

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/outputs/<path:filename>")
def output_file(filename):
    return send_from_directory(app.config["OUTPUT_FOLDER"], filename)

# Profiles
@app.route("/profile/<string:email>", methods=["GET"])
def get_profile(email):
    u = UserProfile.query.filter_by(email=email).first()
    if not u:
        return jsonify({"error":"not found"}), 404
    return jsonify({"email":u.email,"name":u.name,"country":u.country,"plan":u.plan,"credits":u.credits,"photo":u.photo})

@app.route("/profile", methods=["POST"])
def upsert_profile():
    data = request.get_json(force=True)
    email = data.get("email")
    if not email: return jsonify({"error":"email required"}), 400
    u = UserProfile.query.filter_by(email=email).first()
    if not u:
        u = UserProfile(email=email, name=data.get("name"), country=data.get("country"))
        db.session.add(u)
    else:
        u.name = data.get("name", u.name); u.country = data.get("country", u.country)
    db.session.commit()
    return jsonify({"message":"ok","email":u.email})

# Character upload
@app.route("/character", methods=["POST"])
def upload_character():
    user_email = request.form.get("user_email","demo@visora.com")
    name = request.form.get("name","My Character")
    ai_style = request.form.get("ai_style","real")
    mood = request.form.get("mood","neutral")
    photo_path = None
    voice_path = None
    if "photo" in request.files:
        f = request.files["photo"]
        if allowed_file(f.filename, ALLOWED_IMAGE_EXT):
            photo_path = save_upload(f, "characters")
    if "voice" in request.files:
        v = request.files["voice"]
        if allowed_file(v.filename, ALLOWED_AUDIO_EXT):
            voice_path = save_upload(v, "user_voices")
    c = UserCharacter(user_email=user_email, name=name, photo_path=photo_path, voice_path=voice_path, ai_style=ai_style, mood=mood, is_locked=False)
    db.session.add(c); db.session.commit()
    return jsonify({"message":"saved","character_id":c.id, "photo": c.photo_path, "voice": c.voice_path})

@app.route("/characters", methods=["GET"])
def list_characters():
    user_email = request.args.get("user_email","demo@visora.com")
    chars = UserCharacter.query.filter_by(user_email=user_email).all()
    out = []
    for c in chars:
        out.append({"id":c.id,"name":c.name,"photo":c.photo_path,"voice":c.voice_path,"ai_style":c.ai_style,"mood":c.mood})
    return jsonify(out)

# Voices (raw upload)
@app.route("/voice", methods=["POST"])
def upload_voice():
    user_email = request.form.get("user_email","demo@visora.com")
    if "file" not in request.files:
        return jsonify({"error":"no file"}), 400
    f = request.files["file"]
    if not allowed_file(f.filename, ALLOWED_AUDIO_EXT):
        return jsonify({"error":"bad file"}), 400
    rel = save_upload(f, "user_voices")
    return jsonify({"saved": rel, "url": url_for("uploaded_file", filename=str(Path(rel).name), _external=True)})

@app.route("/voices", methods=["GET"])
def list_voices():
    user = request.args.get("user_email","demo@visora.com")
    chars = UserCharacter.query.filter_by(user_email=user).all()
    result = []
    for c in chars:
        if c.voice_path:
            result.append({"source":"character","path":c.voice_path,"character_id":c.id,"name":c.name})
    uvdir = Path(app.config["UPLOAD_FOLDER"]) / "user_voices"
    if uvdir.exists():
        for f in uvdir.iterdir():
            result.append({"source":"file","path": str(Path("user_voices")/f.name),"name":f.name})
    return jsonify(result)

# Templates
@app.route("/templates", methods=["GET"])
def list_templates():
    t = TemplateCatalog.query.order_by(TemplateCatalog.trending_score.desc()).all()
    out = [{"name":x.name,"category":x.category,"thumbnail":x.thumbnail,"score":x.trending_score} for x in t]
    return jsonify(out)

@app.route("/templates/trending", methods=["GET"])
def trending_templates():
    t = TemplateCatalog.query.order_by(TemplateCatalog.trending_score.desc()).limit(6).all()
    out = [{"name":x.name,"category":x.category,"thumbnail":x.thumbnail,"score":x.trending_score} for x in t]
    return jsonify(out)

# Gallery
@app.route("/gallery", methods=["GET"])
def gallery():
    user = request.args.get("user_email","demo@visora.com")
    vids = UserVideo.query.filter_by(user_email=user).order_by(UserVideo.created_at.desc()).all()
    out = []
    for v in vids:
        meta = {}
        try:
            meta = json.loads(v.meta_json) if v.meta_json else {}
        except Exception:
            meta = {}
        out.append({"id":v.id,"title":v.title,"status":v.status,"file":v.file_path,"created_at": v.created_at.isoformat(), "meta": meta})
    return jsonify(out)

# Preview voice (gTTS)
@app.route("/preview_voice", methods=["POST"])
def preview_voice():
    if not GTTS_AVAILABLE:
        return jsonify({"error":"gTTS not available"}), 500
    text = request.form.get("text","Preview from Visora")
    lang = request.form.get("lang","hi")
    try:
        uid = uuid.uuid4().hex
        out = Path(app.config["TMP_FOLDER"]) / f"preview_{uid}.mp3"
        gTTS(text, lang=lang).save(str(out))
        dest = Path(app.config["UPLOAD_FOLDER"]) / "audio" / out.name
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(out), str(dest))
        return jsonify({"audio_rel": str(Path("audio")/dest.name), "audio_url": url_for("uploaded_file", filename=str(Path("audio")/dest.name), _external=True)})
    except Exception as e:
        log.exception("TTS error")
        return jsonify({"error":"TTS failed","details":str(e)}),500

# Assistant
@app.route("/assistant", methods=["POST"])
def assistant():
    data = request.get_json() or {}
    q = data.get("query","")
    tone = data.get("tone","helpful")
    lang = data.get("lang","hi")
    reply = assistant_generate(q, tone=tone)
    audio_url = None
    if GTTS_AVAILABLE:
        try:
            uid = uuid.uuid4().hex
            out = Path(app.config["TMP_FOLDER"]) / f"assistant_{uid}.mp3"
            gTTS(reply, lang=lang).save(str(out))
            dest = Path(app.config["UPLOAD_FOLDER"]) / "audio" / out.name
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(out), str(dest))
            audio_url = url_for("uploaded_file", filename=str(Path("audio")/dest.name), _external=True)
        except Exception:
            audio_url = None
    return jsonify({"reply": reply, "audio_url": audio_url})

# Payments stubs
@app.route("/create_paypal_order", methods=["POST"])
def create_paypal_order():
    return jsonify({"error":"use your PayPal server integration; this is a stub"}), 501

@app.route("/create_razorpay_order", methods=["POST"])
def create_razorpay_order():
    return jsonify({"error":"use your Razorpay server integration; this is a stub"}), 501

# Job status
@app.route("/job_status", methods=["GET"])
def job_status():
    job_id = request.args.get("job_id")
    if not job_id or job_id not in render_jobs:
        return jsonify({"error":"job_id missing or not found"}), 404
    return jsonify(render_jobs[job_id])

# Core: generate_video (enqueue)
@app.route("/generate_video", methods=["POST"])
def generate_video():
    """
    Form-data expected:
    - user_email (optional)
    - title
    - script
    - template
    - quality
    - length_type
    - lang
    - bg_music_file (optional file)
    - bg_music (preset name)
    - characters[] (image files)
    - character_voice_files[] (optional audio files)
    - voice_type[] (optional)
    """
    user_email = request.form.get("user_email","demo@visora.com")
    title = request.form.get("title") or f"Video {datetime.utcnow().isoformat()}"
    script = request.form.get("script","") or ""
    template = request.form.get("template","Default")
    quality = request.form.get("quality","HD")
    length_type = request.form.get("length_type","short")
    lang = request.form.get("lang","hi")
    bg_choice = request.form.get("bg_music","")

    # create DB record
    video = UserVideo(user_email=user_email, title=title, script=script, template=template,
                      quality=quality, length_type=length_type, background_music=bg_choice, status="queued")
    db.session.add(video); db.session.commit()

    job_id = f"video_{video.id}_{uuid.uuid4().hex[:6]}"
    render_jobs[job_id] = {"status":"queued", "video_id": video.id, "created_at": datetime.utcnow().isoformat()}

    # Save character images
    image_rel_paths = []
    if "characters" in request.files:
        files = request.files.getlist("characters")
        for f in files:
            if f and allowed_file(f.filename, ALLOWED_IMAGE_EXT):
                image_rel_paths.append(save_upload(f, "characters"))

    # If none, use template thumbnail or placeholder
    if not image_rel_paths:
        tc = TemplateCatalog.query.filter_by(name=template).first()
        if tc and tc.thumbnail:
            image_rel_paths = [tc.thumbnail]
        else:
            # placeholder
            try:
                from PIL import Image
                placeholder = Path(app.config["TMP_FOLDER"]) / f"{job_id}_ph.png"
                img = Image.new("RGB",(1280,720),(245,245,245))
                img.save(placeholder)
                image_rel_paths = [str(placeholder.relative_to(BASE_DIR))]
            except Exception as e:
                log.exception("placeholder failed")
                video.status="failed"; db.session.commit()
                render_jobs[job_id]["status"] = "failed"
                render_jobs[job_id]["error"] = "placeholder creation failed"
                return jsonify({"status":"error","message":"no characters and placeholder failed","details":str(e)}),400

    # BG music
    bg_rel = None
    if "bg_music_file" in request.files:
        f = request.files.get("bg_music_file")
        if f and allowed_file(f.filename, ALLOWED_AUDIO_EXT):
            bg_rel = save_upload(f, "music")
    else:
        if bg_choice:
            p = Path(app.config["UPLOAD_FOLDER"]) / "music" / f"{bg_choice}.mp3"
            if p.exists(): bg_rel = str(Path("music")/p.name)

    # character voice files
    char_voice_files = []
    if "character_voice_files" in request.files:
        vfiles = request.files.getlist("character_voice_files")
        for vf in vfiles:
            if vf and allowed_file(vf.filename, ALLOWED_AUDIO_EXT):
                char_voice_files.append(save_upload(vf, "user_voices"))

    # build audio per character: uploaded voice else TTS (gTTS) or silent fallback
    audio_rel_paths = []
    for i in range(len(image_rel_paths)):
        if i < len(char_voice_files):
            audio_rel_paths.append(char_voice_files[i])
            continue
        # generate TTS from script split (simple round-robin)
        # split script roughly
        sentences = [s.strip() for s in script.replace("\r","\n").split("\n") if s.strip()]
        if not sentences:
            text_for_char = "Hello from Visora"
        else:
            # distribute sentences round-robin
            char_texts = [""] * len(image_rel_paths)
            for idx, s in enumerate(sentences):
                char_texts[idx % len(image_rel_paths)] += (s + " ")
            text_for_char = char_texts[i].strip() if i < len(char_texts) else ""
            if not text_for_char:
                text_for_char = sentences[0]
        if GTTS_AVAILABLE:
            try:
                uid = uuid.uuid4().hex
                out = Path(app.config["TMP_FOLDER"]) / f"{job_id}_{i}_{uid}.mp3"
                gTTS(text_for_char, lang=lang).save(str(out))
                dest = Path(app.config["UPLOAD_FOLDER"]) / "audio" / out.name
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(str(out), str(dest))
                audio_rel_paths.append(str(Path("audio")/dest.name))
                continue
            except Exception as e:
                log.exception("gTTS failed for char %s: %s", i, e)
        # fallback empty file (moviepy may error; better to generate tiny silent mp3 in production)
        p = Path(app.config["TMP_FOLDER"]) / f"{job_id}_silent_{i}.mp3"
        p.write_bytes(b"")
        audio_rel_paths.append(str(p.relative_to(BASE_DIR)))

    # prepare output path
    out_name = f"{job_id}.mp4"
    out_abs = str(Path(app.config["OUTPUT_FOLDER"]) / out_name)

    # update DB record meta and status
    video.status = "queued"
    video.meta_json = json.dumps({"script": script, "characters": image_rel_paths, "voices": audio_rel_paths, "template": template, "quality": quality, "created_at": datetime.utcnow().isoformat()})
    db.session.commit()

    # enqueue job
    render_queue.put({"job_id": job_id, "images": image_rel_paths, "audios": audio_rel_paths, "bg": bg_rel, "out_abs": out_abs, "quality": quality})
    render_jobs[job_id]["status"] = "queued"
    render_jobs[job_id]["video_id"] = video.id
    render_jobs[job_id]["out_name"] = out_name

    return jsonify({"status":"queued","job_id":job_id,"video_id":video.id,"preview_url": None, "note":"Job queued. Poll /job_status?job_id=<job_id>"}), 200

# simple edit endpoint (stub)
@app.route("/video/edit/<int:video_id>", methods=["POST"])
def edit_video(video_id):
    # For production implement: fetch existing meta, accept replace voice/bg music/apply cinematic, enqueue new job
    return jsonify({"error":"not implemented","note":"Implement per project needs"}), 501

# ---------- Run ----------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
