const API_BASE = "https://visora.onrender.com";

let uploadedVideo = null;

// Load video preview
document.getElementById("btn_load").addEventListener("click", ()=>{
  const file = document.getElementById("video_upload").files[0];
  if (!file) return alert("Select a video");
  uploadedVideo = file;
  const url = URL.createObjectURL(file);
  const preview = document.getElementById("video_preview");
  preview.src = url;
  preview.classList.remove("hidden");
});

// Trim video
document.getElementById("btn_trim").addEventListener("click", async ()=>{
  if (!uploadedVideo) return alert("Upload video first!");
  const fd = new FormData();
  fd.append("video", uploadedVideo);
  fd.append("start", document.getElementById("trim_start").value);
  fd.append("end", document.getElementById("trim_end").value);
  const res = await fetch(`${API_BASE}/video-trim`, { method:"POST", body:fd });
  const data = await res.json();
  document.getElementById("trim_resp").innerText = "Job: " + JSON.stringify(data);
});

// Merge
document.getElementById("btn_merge").addEventListener("click", async ()=>{
  const files = document.getElementById("merge_files").files;
  if (!files.length) return alert("Select videos!");
  const fd = new FormData();
  for (let f of files) fd.append("videos", f);
  const res = await fetch(`${API_BASE}/video-merge`, { method:"POST", body:fd });
  const data = await res.json();
  document.getElementById("merge_resp").innerText = "Job: " + JSON.stringify(data);
});

// Subtitles
document.getElementById("btn_subs").addEventListener("click", async ()=>{
  const file = document.getElementById("subs_file").files[0];
  if (!file) return alert("Upload subtitle file!");
  const fd = new FormData();
  fd.append("video", uploadedVideo);
  fd.append("subs", file);
  fd.append("lang", document.getElementById("subs_lang").value);
  const res = await fetch(`${API_BASE}/video-add-subs`, { method:"POST", body:fd });
  const data = await res.json();
  document.getElementById("subs_resp").innerText = "Job: " + JSON.stringify(data);
});

document.getElementById("btn_trans").addEventListener("click", async ()=>{
  const fd = new FormData();
  fd.append("video", uploadedVideo);
  fd.append("target_lang", document.getElementById("subs_lang").value);
  const res = await fetch(`${API_BASE}/video-translate-subs`, { method:"POST", body:fd });
  const data = await res.json();
  document.getElementById("subs_resp").innerText = "Translated: " + JSON.stringify(data);
});

// BG Music
document.getElementById("btn_bg").addEventListener("click", async ()=>{
  const file = document.getElementById("bg_music").files[0];
  if (!file) return alert("Upload music!");
  const fd = new FormData();
  fd.append("video", uploadedVideo);
  fd.append("music", file);
  const res = await fetch(`${API_BASE}/video-add-music`, { method:"POST", body:fd });
  const data = await res.json();
  document.getElementById("bg_resp").innerText = "Job: " + JSON.stringify(data);
});

// Effects
document.getElementById("btn_effect").addEventListener("click", async ()=>{
  const effect = document.getElementById("effect_select").value;
  const fd = new FormData();
  fd.append("video", uploadedVideo);
  fd.append("effect", effect);
  const res = await fetch(`${API_BASE}/video-effect`, { method:"POST", body:fd });
  const data = await res.json();
  document.getElementById("effect_resp").innerText = "Applied: " + JSON.stringify(data);
});
