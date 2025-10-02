const API_BASE = "https://visora.onrender.com";
let uploadedVideoId = null;

document.getElementById("uploadBtn").onclick = async () => {
  const file = document.getElementById("videoFile").files[0];
  if (!file) return alert("Please select a video");

  const fd = new FormData();
  fd.append("video", file);
  const res = await fetch(`${API_BASE}/editor/upload`, { method:"POST", body:fd });
  const j = await res.json();
  uploadedVideoId = j.video_id;
  document.getElementById("uploadResp").innerText = "✅ Uploaded: " + j.video_id;
};

async function trimVideo() {
  const start = document.getElementById("trimStart").value;
  const end = document.getElementById("trimEnd").value;
  const res = await fetch(`${API_BASE}/editor/trim`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ video_id:uploadedVideoId, start, end })
  });
  const j = await res.json();
  document.getElementById("editorResp").innerText = "⏳ Trim job: " + j.job_id;
}

async function mergeVideo() {
  const file = document.getElementById("mergeFile").files[0];
  const fd = new FormData();
  fd.append("video", file);
  fd.append("base_video", uploadedVideoId);
  const res = await fetch(`${API_BASE}/editor/merge`, { method:"POST", body:fd });
  const j = await res.json();
  document.getElementById("editorResp").innerText = "🔗 Merge job: " + j.job_id;
}

async function autoSubtitles() {
  const res = await fetch(`${API_BASE}/editor/subtitles`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ video_id:uploadedVideoId })
  });
  const j = await res.json();
  document.getElementById("editorResp").innerText = "💬 Subtitles job: " + j.job_id;
}

async function uploadSubtitles() {
  alert("📂 Feature: upload .srt → backend API");
}

async function addMusic() {
  const file = document.getElementById("musicFile").files[0];
  const fd = new FormData();
  fd.append("music", file);
  fd.append("video_id", uploadedVideoId);
  const res = await fetch(`${API_BASE}/editor/add-music`, { method:"POST", body:fd });
  const j = await res.json();
  document.getElementById("editorResp").innerText = "🎵 Music job: " + j.job_id;
}

async function applyFilter() {
  const filter = document.getElementById("filterType").value;
  const res = await fetch(`${API_BASE}/editor/filter`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ video_id:uploadedVideoId, filter })
  });
  const j = await res.json();
  document.getElementById("editorResp").innerText = "🎨 Filter job: " + j.job_id;
}

async function addWatermark() {
  const file = document.getElementById("wmFile").files[0];
  const fd = new FormData();
  fd.append("watermark", file);
  fd.append("video_id", uploadedVideoId);
  const res = await fetch(`${API_BASE}/editor/watermark`, { method:"POST", body:fd });
  const j = await res.json();
  document.getElementById("editorResp").innerText = "🖼 Watermark job: " + j.job_id;
}
