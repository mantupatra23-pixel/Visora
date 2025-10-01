// Sidebar Toggle
const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.querySelector(".toggle-btn");
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}

// Global API base
const API_BASE = "http://127.0.0.1:5000"; // change if backend live on render

// Create Video from Script
async function createVideoFromScript(scriptText) {
  try {
    const res = await fetch(`${API_BASE}/create-video-script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script: scriptText })
    });
    const data = await res.json();
    alert("🎬 Video job started! ID: " + data.job_id);
  } catch (err) {
    console.error(err);
    alert("❌ Error creating video from script");
  }
}

// Image → Video
async function createVideoFromImage(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);
  try {
    const res = await fetch(`${API_BASE}/create-video-image`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    alert("🖼 Video from image started! Job: " + data.job_id);
  } catch (err) {
    console.error(err);
  }
}

// Audio → Video
async function createVideoFromAudio(audioFile) {
  const formData = new FormData();
  formData.append("audio", audioFile);
  try {
    const res = await fetch(`${API_BASE}/create-video-audio`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    alert("🎧 Audio overlay started! Job: " + data.job_id);
  } catch (err) {
    console.error(err);
  }
}

// TTS → Video
async function createVideoFromTTS(text, voice) {
  try {
    const res = await fetch(`${API_BASE}/create-video-tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice })
    });
    const data = await res.json();
    alert("🔊 TTS video started! Job: " + data.job_id);
  } catch (err) {
    console.error(err);
  }
}

// Video → Voice Replace
async function replaceVoice(videoFile, newVoice) {
  const formData = new FormData();
  formData.append("video", videoFile);
  formData.append("voice", newVoice);
  try {
    const res = await fetch(`${API_BASE}/replace-voice`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    alert("🎤 Voice replaced! Job: " + data.job_id);
  } catch (err) {
    console.error(err);
  }
}

// Video → Audio Extract
async function extractAudio(videoFile) {
  const formData = new FormData();
  formData.append("video", videoFile);
  try {
    const res = await fetch(`${API_BASE}/extract-audio`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    alert("🎶 Audio extracted! File: " + data.audio_url);
  } catch (err) {
    console.error(err);
  }
}

// Slideshow Maker
async function createSlideshow(images, musicFile) {
  const formData = new FormData();
  images.forEach(img => formData.append("images", img));
  formData.append("music", musicFile);
  try {
    const res = await fetch(`${API_BASE}/create-slideshow`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    alert("📽 Slideshow started! Job: " + data.job_id);
  } catch (err) {
    console.error(err);
  }
}

// Load Recent Jobs
async function loadJobs() {
  try {
    const res = await fetch(`${API_BASE}/jobs`);
    const data = await res.json();
    const jobsList = document.getElementById("jobs-list");
    jobsList.innerHTML = "";
    data.jobs.forEach(job => {
      let item = document.createElement("li");
      item.textContent = `${job.id} - ${job.status}`;
      jobsList.appendChild(item);
    });
  } catch (err) {
    console.error(err);
  }
}

// Run loadJobs every 10 sec
setInterval(loadJobs, 10000);
