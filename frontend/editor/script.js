const API_BASE = "https://visora.onrender.com";

async function apiCall(endpoint, formData) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { method: "POST", body: formData });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

// Trim
document.getElementById("trim_btn").onclick = async () => {
  const file = document.getElementById("edit_video").files[0];
  const start = document.getElementById("trim_start").value;
  const end = document.getElementById("trim_end").value;
  const fd = new FormData();
  fd.append("video", file);
  fd.append("start", start);
  fd.append("end", end);
  const res = await apiCall("/edit-trim", fd);
  document.getElementById("edit_resp").innerText = "✅ Trim job: " + res.job_id;
};

// Merge
document.getElementById("merge_btn").onclick = async () => {
  const files = document.getElementById("merge_videos").files;
  const fd = new FormData();
  for (let f of files) fd.append("videos", f);
  const res = await apiCall("/edit-merge", fd);
  document.getElementById("edit_resp").innerText = "✅ Merge job: " + res.job_id;
};

// Subtitles
document.getElementById("sub_btn").onclick = async () => {
  const file = document.getElementById("edit_video").files[0];
  const text = document.getElementById("sub_text").value;
  const lang = document.getElementById("sub_lang").value;
  const fd = new FormData();
  fd.append("video", file);
  fd.append("text", text);
  fd.append("lang", lang);
  const res = await apiCall("/edit-subtitles", fd);
  document.getElementById("edit_resp").innerText = "✅ Subtitles added: " + res.job_id;
};

// Background Music
document.getElementById("bg_btn").onclick = async () => {
  const file = document.getElementById("edit_video").files[0];
  const music = document.getElementById("bg_music").files[0];
  const fd = new FormData();
  fd.append("video", file);
  fd.append("music", music);
  const res = await apiCall("/edit-bg-music", fd);
  document.getElementById("edit_resp").innerText = "✅ Music added: " + res.job_id;
};

// Filters
document.getElementById("filter_btn").onclick = async () => {
  const file = document.getElementById("edit_video").files[0];
  const filter = document.getElementById("filter_type").value;
  const fd = new FormData();
  fd.append("video", file);
  fd.append("filter", filter);
  const res = await apiCall("/edit-filter", fd);
  document.getElementById("edit_resp").innerText = "✅ Filter applied: " + res.job_id;
};

// Watermark
document.getElementById("wm_btn").onclick = async () => {
  const file = document.getElementById("edit_video").files[0];
  const wm = document.getElementById("watermark").files[0];
  const fd = new FormData();
  fd.append("video", file);
  fd.append("watermark", wm);
  const res = await apiCall("/edit-watermark", fd);
  document.getElementById("edit_resp").innerText = "✅ Watermark added: " + res.job_id;
};
