const API_BASE = "https://visora.onrender.com"; // backend live API

const preview = document.getElementById("preview");
const videoFile = document.getElementById("videoFile");

videoFile.addEventListener("change", () => {
  const file = videoFile.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
  }
});

async function trimVideo() {
  const start = document.getElementById("trimStart").value;
  const end = document.getElementById("trimEnd").value;
  const file = videoFile.files[0];
  if (!file) return alert("Upload a video first!");
  const fd = new FormData();
  fd.append("video", file);
  fd.append("start", start);
  fd.append("end", end);
  const res = await fetch(`${API_BASE}/video-trim`, { method: "POST", body: fd });
  const data = await res.json();
  document.getElementById("editorResp").innerText = "Trim Job: " + JSON.stringify(data);
}

async function mergeVideo() {
  const file1 = videoFile.files[0];
  const file2 = document.getElementById("mergeFile").files[0];
  if (!file1 || !file2) return alert("Upload both videos!");
  const fd = new FormData();
  fd.append("video1", file1);
  fd.append("video2", file2);
  const res = await fetch(`${API_BASE}/video-merge`, { method: "POST", body: fd });
  const data = await res.json();
  document.getElementById("editorResp").innerText = "Merge Job: " + JSON.stringify(data);
}

async function addSubtitles() {
  const file = videoFile.files[0];
  const text = document.getElementById("subsText").value;
  const lang = document.getElementById("subsLang").value;
  if (!file || !text) return alert("Upload video + subtitles text!");
  const fd = new FormData();
  fd.append("video", file);
  fd.append("subtitles", text);
  fd.append("lang", lang);
  const res = await fetch(`${API_BASE}/video-add-subs`, { method: "POST", body: fd });
  const data = await res.json();
  document.getElementById("editorResp").innerText = "Subtitles Job: " + JSON.stringify(data);
}

async function translateSubtitles() {
  const file = videoFile.files[0];
  const target = document.getElementById("translateLang").value;
  if (!file) return alert("Upload a video!");
  const fd = new FormData();
  fd.append("video", file);
  fd.append("target_lang", target);
  const res = await fetch(`${API_BASE}/video-translate-subs`, { method: "POST", body: fd });
  const data = await res.json();
  document.getElementById("editorResp").innerText = "Translate Job: " + JSON.stringify(data);
}
