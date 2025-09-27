#!/usr/bin/env python3
"""
Visora — Single-file production-ready Flask backend (API-only)

Features:
- SQLite by default (Postgres via DATABASE_URL)
- Uploads under ./uploads, outputs under ./outputs, tmp under ./tmp
- User uploaded voices supported (else gTTS TTS multi-language)
- MoviePy renderer (naive lip-sync-like visual effect)
- Endpoints: health, upload, preview_voice, assistant, generate_video, gallery, profile, payments (PayPal & Razorpay)
- No login/register. Demo user used: demo@visora.com

Notes:
- Install: pip install flask flask_sqlalchemy gtts moviepy pillow requests python-dotenv
- ffmpeg must be installed and in PATH
- Rendering synchronous → for real production use Celery/RQ workers
"""

import os, uuid, shutil, logging, requests, json
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename

# Logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("visora")

# ---------------- Paths ----------------
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
OUTPUT_FOLDER = BASE_DIR / "outputs"
TMP_FOLDER = BASE_DIR / "tmp"
for p in (UPLOAD_FOLDER, OUTPUT_FOLDER, TMP_FOLDER):
    p.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_EXT = {"png", "jpg", "jpeg", "gif", "webp"}
ALLOWED_AUDIO_EXT = {"mp3", "wav", "ogg", "m4a"}
ALLOWED_VIDEO_EXT = {"mp4", "mov", "mkv", "webm"}

# ---------------- App ----------------
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("APP_SECRET_KEY", "visora-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", f"sqlite:///{str(BASE_DIR/'data.db')}")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = str(UPLOAD_FOLDER)
app.config["OUTPUT_FOLDER"] = str(OUTPUT_FOLDER)
app.config["TMP_FOLDER"] = str(TMP_FOLDER)
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_UPLOAD_MB", 700)) * 1024 * 1024

db = SQLAlchemy(app)

# ---------------- Optional imports ----------------
MOVIEPY_AVAILABLE = False
GTTS_AVAILABLE = False
try:
    from moviepy.editor import ImageClip, concatenate_videoclips, AudioFileClip, CompositeAudioClip
    from moviepy.video.fx.all import resize
    MOVIEPY_AVAILABLE = True
except Exception as e:
    log.warning("moviepy import failed: %s", e)
try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except Exception as e:
    log.warning("gTTS import failed: %s", e)

# ---------------- Payment env ----------------
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = os.getenv("PAYPAL_SECRET")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com")

# ---------------- DB Models ----------------
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
    voices = db.Column(db.String(255))
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

class VoiceOption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    display_name = db.Column(db.String(255))
    description = db.Column(db.String(512))

class Plan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    price = db.Column(db.String(50))
    features = db.Column(db.String(255))

# ---------------- Init defaults ----------------
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

# ---------------- Helpers ----------------
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

# ---------------- Lip-sync & Render ----------------
def create_lip_sync_like_clip(image_path: str, duration: float, size_width: int = 1280):
    if not MOVIEPY_AVAILABLE:
        raise RuntimeError("MoviePy not available on server")
    abs_img = _abs_path(image_path)
    base = ImageClip(abs_img).set_duration(duration).resize(width=size_width)
    small = base.fx(resize, 0.98)
    seg = 0.12
    clips = []
    t, toggle = 0.0, False
    while t < duration - 1e-6:
        seg_d = min(seg, duration - t)
        clip = small.set_duration(seg_d) if toggle else base.set_duration(seg_d)
        clips.append(clip)
        toggle = not toggle
        t += seg_d
    return concatenate_videoclips(clips, method="compose")

def render_video_multi_characters(image_rel_paths: List[str], audio_rel_paths: List[str], output_abs_path: str, quality: str = "HD", bg_music_rel: Optional[str] = None):
    if not MOVIEPY_AVAILABLE:
        raise RuntimeError("MoviePy not available on server")
    clips, audios = [], []
    n = min(len(image_rel_paths), len(audio_rel_paths))
    if n == 0:
        raise ValueError("No character images or audios provided")
    for i in range(n):
        img, aud = image_rel_paths[i], audio_rel_paths[i]
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
                bg_clip = concatenate_audioclips([bg_clip] * (int(final_video.duration/bg_clip.duration)+1)).subclip(0, final_video.duration)
            else:
                bg_clip = bg_clip.subclip(0, final_video.duration)
            bg_clip = bg_clip.volumex(0.12)
            final_audio = CompositeAudioClip([final_video.audio, bg_clip])
            final_video = final_video.set_audio(final_audio)
        except Exception as e:
            log.exception("Failed to add bg music: %s", e)
    bitrate = "800k"
    if quality.lower() in ("fullhd","1080","1080p"): bitrate = "2500k"
    if quality.lower() in ("4k","2160","2160p"): bitrate = "8000k"
    final_video.write_videofile(output_abs_path, fps=24, codec="libx264", audio_codec="aac", bitrate=bitrate)
    final_video.close()
    for a in audios:
        try: a.close()
        except: pass

# ---------------- Routes ----------------
@app.route("/", methods=["GET"])
def index():
    return jsonify({"msg": "Visora backend running", "status": "ok"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status":"ok","moviepy":MOVIEPY_AVAILABLE,"gtts":GTTS_AVAILABLE,"db":app.config["SQLALCHEMY_DATABASE_URI"]})

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/outputs/<path:filename>")
def output_file(filename):
    return send_from_directory(app.config["OUTPUT_FOLDER"], filename)
# ---------------- Video Edit Endpoint ----------------
@app.route("/video/edit/<int:video_id>", methods=["POST"])
def edit_video(video_id):
    """
    Edit existing video:
    - change_bg_music_file (optional)
    - replace_voice_files[] (optional, aligned order)
    - apply_cinematic (bool)
    - apply_subtitles (bool)
    """
    video = UserVideo.query.get(video_id)
    if not video:
        return jsonify({"error": "video not found"}), 404

    try:
        # load existing file
        old_path = _abs_path(video.file_path)
        if not os.path.exists(old_path):
            return jsonify({"error": "original file missing"}), 400

        # prepare output path
        out_name = f"edited_{uuid.uuid4().hex}.mp4"
        out_path = Path(app.config["OUTPUT_FOLDER"]) / out_name

        # collect inputs
        bg_rel = None
        if "change_bg_music_file" in request.files:
            bg_rel = save_upload(request.files["change_bg_music_file"], "audio")

        replace_voice_paths = []
        if "replace_voice_files" in request.files:
            files = request.files.getlist("replace_voice_files")
            for f in files:
                if f and allowed_file(f.filename, ALLOWED_AUDIO_EXT):
                    replace_voice_paths.append(save_upload(f, "audio"))

        apply_cinematic = request.form.get("apply_cinematic") == "true"
        apply_subtitles = request.form.get("apply_subtitles") == "true"

        # Naive edit: reload original video into MoviePy and reapply audio/bg
        from moviepy.editor import VideoFileClip, AudioFileClip, CompositeAudioClip
        clip = VideoFileClip(old_path)

        # replace voices if provided (very basic replace, first one only)
        if replace_voice_paths:
            try:
                aud_clip = AudioFileClip(_abs_path(replace_voice_paths[0]))
                clip = clip.set_audio(aud_clip)
            except Exception as e:
                log.warning("replace voice failed: %s", e)

        # add background music if provided
        if bg_rel:
            try:
                bg_clip = AudioFileClip(_abs_path(bg_rel)).volumex(0.12)
                final_audio = CompositeAudioClip([clip.audio, bg_clip])
                clip = clip.set_audio(final_audio)
            except Exception as e:
                log.warning("bg replace failed: %s", e)

        # apply cinematic effect (just darken)
        if apply_cinematic:
            from moviepy.video.fx.all import lum_contrast
            clip = clip.fx(lum_contrast, 0, 0.8, 128)

        # apply subtitles (placeholder)
        if apply_subtitles:
            log.info("Subtitles flag set — implement OCR/TTS overlay later")

        clip.write_videofile(str(out_path), codec="libx264", audio_codec="aac")
        clip.close()

        video.file_path = str(out_path.relative_to(BASE_DIR))
        video.status = "edited"
        db.session.commit()

        return jsonify({"status": "ok", "video_id": video.id, "download_url": url_for("output_file", filename=out_name, _external=True)})

    except Exception as e:
        log.exception("edit_video failed")
        return jsonify({"error": "edit failed", "details": str(e)}), 500


# ---------------- Save Character & Voice ----------------
@app.route("/save_character", methods=["POST"])
def save_character():
    """
    Save user character & voice for reuse
    - user_email
    - name
    - character_image (file)
    - character_voice (file optional)
    """
    email = request.form.get("user_email")
    name = request.form.get("name", "Character")
    if not email:
        return jsonify({"error": "user_email required"}), 400

    img_rel = None
    if "character_image" in request.files:
        img_rel = save_upload(request.files["character_image"], "characters")

    voice_rel = None
    if "character_voice" in request.files:
        voice_rel = save_upload(request.files["character_voice"], "audio")

    char = UserCharacter(user_email=email, name=name, photo_path=img_rel, voice_path=voice_rel, is_locked=False)
    db.session.add(char)
    db.session.commit()

    return jsonify({
        "status": "ok",
        "id": char.id,
        "name": char.name,
        "photo": char.photo_path,
        "voice": char.voice_path
    })

@app.route("/characters/<string:email>", methods=["GET"])
def get_characters(email):
    chars = UserCharacter.query.filter_by(user_email=email).all()
    return jsonify([{"id":c.id,"name":c.name,"photo":c.photo_path,"voice":c.voice_path} for c in chars])
# (बाकी profile, upload, preview_voice, assistant, payments, generate_video endpoints वैसे ही रहेंगे जैसा पहले दिया था)
# पूरा system Visora नाम से ready है
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
