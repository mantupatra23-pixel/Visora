// ================== SIDEBAR TOGGLE ==================
const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.querySelector(".toggle-btn");
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}

// ================== GLOBAL CONFIG ==================
/**
 * CHANGE THIS before publishing:
 * - Set to your production backend base URL (HTTPS).
 */
const API_BASE = "https://visora.onrender.com"; // <- replace with your live backend

// Helper: safe fetch wrapper for JSON responses
async function fetchJson(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    // may be empty response (204)
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return await res.json();
    return { ok: true };
  } catch (err) {
    console.error("fetchJson error:", err);
    throw err;
  }
}

// ================== API CALL HELPERS ==================
async function apiCall(endpoint, body = {}) {
  return await fetchJson(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include"
  });
}

async function apiCallForm(endpoint, formData) {
  return await fetchJson(`${API_BASE}${endpoint}`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });
}

// ================== NOTIFICATIONS ==================
async function sendNotification(message, type = "info") {
  try {
    await apiCall("/notify", { message, type });
  } catch (err) {
    console.error("Notification failed:", err);
  }
}

// Small UI helper
function showToast(msg) {
  // minimal fallback: alert (replace with toast UI)
  try {
    const el = document.getElementById("toast");
    if (el) {
      el.innerText = msg;
      el.classList.add("visible");
      setTimeout(() => el.classList.remove("visible"), 4000);
      return;
    }
  } catch (e) {}
  alert(msg);
}

// ================== VIDEO CREATION ==================
// Create Video from Script
async function createVideoFromScript(scriptText, options = {}) {
  try {
    const res = await apiCall("/create-video-script", { script: scriptText, ...options });
    showToast("🎬 Job started: " + (res.job_id || "unknown"));
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error starting script → video");
    throw err;
  }
}

// Image → Video
async function createVideoFromImage(imageFile, options = {}) {
  const fd = new FormData();
  fd.append("image", imageFile);
  Object.entries(options).forEach(([k, v]) => fd.append(k, v));
  try {
    const res = await apiCallForm("/create-video-image", fd);
    showToast("🖼 Job started: " + (res.job_id || "unknown"));
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error starting image → video");
    throw err;
  }
}

// Audio → Video (overlay)
async function createVideoFromAudio(audioFile, options = {}) {
  const fd = new FormData();
  fd.append("audio", audioFile);
  Object.entries(options).forEach(([k, v]) => fd.append(k, v));
  try {
    const res = await apiCallForm("/create-video-audio", fd);
    showToast("🎧 Job started: " + (res.job_id || "unknown"));
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error starting audio → video");
    throw err;
  }
}

// TTS → Video
async function createVideoFromTTS(text, voice = "default", options = {}) {
  try {
    const res = await apiCall("/create-video-tts", { text, voice, ...options });
    showToast("🔊 Job started: " + (res.job_id || "unknown"));
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error starting TTS → video");
    throw err;
  }
}

// Video → Voice Replace
async function replaceVoice(videoFile, newVoice) {
  const fd = new FormData();
  fd.append("video", videoFile);
  fd.append("voice", newVoice);
  try {
    const res = await apiCallForm("/replace-voice", fd);
    showToast("🎤 Voice replace started: " + (res.job_id || "unknown"));
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error replacing voice");
    throw err;
  }
}

// Video → Audio Extract
async function extractAudio(videoFile) {
  const fd = new FormData();
  fd.append("video", videoFile);
  try {
    const res = await apiCallForm("/extract-audio", fd);
    showToast("🎶 Audio extracted");
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error extracting audio");
    throw err;
  }
}

// Slideshow Maker
async function createSlideshow(images, musicFile, options = {}) {
  const fd = new FormData();
  images.forEach(img => fd.append("images", img));
  if (musicFile) fd.append("music", musicFile);
  Object.entries(options).forEach(([k, v]) => fd.append(k, v));
  try {
    const res = await apiCallForm("/create-slideshow", fd);
    showToast("📽 Slideshow job started: " + (res.job_id || "unknown"));
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error starting slideshow");
    throw err;
  }
}

// ================== EXTRA VIDEO FEATURES ==================
async function createAIAvatarVideo(imageFile, text, options = {}) {
  const fd = new FormData();
  fd.append("avatar", imageFile);
  fd.append("script", text);
  Object.entries(options).forEach(([k, v]) => fd.append(k, v));
  try {
    const res = await apiCallForm("/create-ai-avatar", fd);
    showToast("🤖 Avatar job started: " + (res.job_id || "unknown"));
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error creating AI avatar video");
    throw err;
  }
}

async function createTemplateVideo(templateName, script, options = {}) {
  try {
    const res = await apiCall("/create-template-video", { template: templateName, script, ...options });
    showToast("Template job started: " + (res.job_id || "unknown"));
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error starting template video");
    throw err;
  }
}

async function addSubtitles(videoFile, lang = "en") {
  const fd = new FormData();
  fd.append("video", videoFile);
  fd.append("language", lang);
  try {
    const res = await apiCallForm("/add-subtitles", fd);
    showToast("✍️ Subtitles job started");
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error adding subtitles");
    throw err;
  }
}

async function translateSubtitles(videoFile, targetLang = "hi") {
  const fd = new FormData();
  fd.append("video", videoFile);
  fd.append("target_lang", targetLang);
  try {
    const res = await apiCallForm("/translate-subtitles", fd);
    showToast("🌐 Subtitle translation started");
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error translating subtitles");
    throw err;
  }
}

// ================== AUDIO TOOLS ==================
async function reduceNoise(audioFile) {
  const fd = new FormData();
  fd.append("audio", audioFile);
  try {
    const res = await apiCallForm("/audio-noise-reduce", fd);
    showToast("🔊 Noise reduction started");
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error reducing noise");
    throw err;
  }
}

async function normalizeAudio(audioFile) {
  const fd = new FormData();
  fd.append("audio", audioFile);
  try {
    const res = await apiCallForm("/audio-normalize", fd);
    showToast("🔊 Audio normalize started");
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error normalizing audio");
    throw err;
  }
}

async function translateAudio(audioFile, lang = "hi") {
  const fd = new FormData();
  fd.append("audio", audioFile);
  fd.append("target_lang", lang);
  try {
    const res = await apiCallForm("/audio-translate", fd);
    showToast("🔁 Audio translation started");
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error translating audio");
    throw err;
  }
}

async function compressAudio(audioFile) {
  const fd = new FormData();
  fd.append("audio", audioFile);
  try {
    const res = await apiCallForm("/audio-compress", fd);
    showToast("🔽 Audio compress started");
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error compressing audio");
    throw err;
  }
}

// ================== FILE TOOLS ==================
async function convertFormat(file, type) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", type); // e.g. 'video-to-audio'
  try {
    const res = await apiCallForm("/convert-format", fd);
    showToast("🔄 Conversion started");
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error converting file");
    throw err;
  }
}

async function compressVideo(videoFile) {
  const fd = new FormData();
  fd.append("video", videoFile);
  try {
    const res = await apiCallForm("/compress-video", fd);
    showToast("🔽 Video compress started");
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error compressing video");
    throw err;
  }
}

// ================== DOWNLOAD & SHARE ==================
async function getDownloadOptions(jobId) {
  return await fetchJson(`${API_BASE}/download-options/${jobId}`, { credentials: "include" });
}

async function shareVideo(jobId, platform) {
  return await apiCall(`/share-video/${jobId}`, { platform });
}

// ================== JOBS ==================
async function loadJobs() {
  try {
    const res = await fetch(`${API_BASE}/jobs`, { credentials: "include" });
    if (!res.ok) throw new Error("Jobs fetch failed");
    const data = await res.json();
    const jobsList = document.getElementById("jobs-list");
    if (!jobsList) return;
    jobsList.innerHTML = "";
    (data.jobs || []).forEach(job => {
      let item = document.createElement("li");
      item.className = "job-item";
      item.innerHTML = `<strong>${job.id}</strong> — ${job.status} <small>${job.created_at || ""}</small>`;
      jobsList.appendChild(item);
    });
  } catch (err) {
    console.error("loadJobs", err);
  }
}
setInterval(loadJobs, 10000);
loadJobs(); // initial

// ================== CREDITS & PAYMENTS ==================
async function getCredits() {
  try {
    const res = await apiCall("/get-credits", {});
    return res;
  } catch (err) {
    console.error(err);
  }
}

async function topUpCredits(amount, method = "razorpay") {
  try {
    const res = await apiCall("/topup-credits", { amount, method });
    return res;
  } catch (err) {
    console.error(err);
  }
}

// ================== PROFILE ==================
async function getProfile() {
  try {
    const res = await apiCall("/profile", {});
    return res;
  } catch (err) {
    console.error(err);
  }
}

async function updateProfile(data) {
  try {
    const res = await apiCall("/update-profile", data);
    showToast("Profile updated");
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error updating profile");
  }
}

// ================== SETTINGS ==================
async function updateSettings(settings) {
  try {
    const res = await apiCall("/update-settings", settings);
    showToast("Settings saved");
    return res;
  } catch (err) {
    console.error(err);
    showToast("❌ Error saving settings");
  }
}

// ================== ADMIN PANEL ==================
async function getAllUsers() {
  try {
    return await apiCall("/admin/users", {});
  } catch (err) {
    console.error("getAllUsers", err);
  }
}

async function getAnalytics() {
  try {
    return await apiCall("/admin/analytics", {});
  } catch (err) {
    console.error("getAnalytics", err);
  }
}

// ================== UTILITIES ==================
function toBaseFilename(path) {
  try {
    return path.split("/").pop();
  } catch (e) { return path; }
}

// Provide debug helper visible on console
window.VisoraAPI = {
  createVideoFromScript,
  createVideoFromImage,
  createVideoFromAudio,
  createVideoFromTTS,
  replaceVoice,
  extractAudio,
  createSlideshow,
  createAIAvatarVideo,
  createTemplateVideo,
  addSubtitles,
  translateSubtitles,
  reduceNoise,
  normalizeAudio,
  translateAudio,
  compressAudio,
  convertFormat,
  compressVideo,
  getDownloadOptions,
  shareVideo,
  loadJobs,
  getCredits,
  topUpCredits,
  getProfile,
  updateProfile,
  updateSettings,
  getAllUsers,
  getAnalytics
};
const API_BASE = "https://visora.onrender.com";
