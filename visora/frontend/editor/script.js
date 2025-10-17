const API_BASE = "https://visora.onrender.com";

document.getElementById("videoFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    document.getElementById("videoPreview").src = url;
  }
});

async function trimVideo() {
  await callEditor("/edit/trim");
}
async function mergeVideos() {
  await callEditor("/edit/merge");
}
async function addSubtitles() {
  await callEditor("/edit/add-subtitles");
}
async function translateSubtitles() {
  await callEditor("/edit/translate-subtitles");
}
async function addBackgroundMusic() {
  await callEditor("/edit/add-music");
}
async function applyFilter() {
  await callEditor("/edit/apply-filter");
}
async function addWatermark() {
  await callEditor("/edit/add-watermark");
}
async function changeAspectRatio() {
  await callEditor("/edit/change-aspect");
}

async function callEditor(endpoint) {
  const video = document.getElementById("videoFile").files[0];
  if (!video) return alert("Upload a video first!");
  const fd = new FormData();
  fd.append("video", video);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { method: "POST", body: fd });
    const data = await res.json();
    document.getElementById("editor_resp").innerText = "✅ Job started: " + JSON.stringify(data);
  } catch (err) {
    console.error(err);
    document.getElementById("editor_resp").innerText = "❌ Error: " + err;
  }
}
