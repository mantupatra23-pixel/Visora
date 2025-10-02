const API_BASE = "https://visora.onrender.com";

// Helper
async function postForm(endpoint, formData, respEl) {
  document.getElementById(respEl).innerText = "⏳ Processing...";
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { method:"POST", body:formData });
    const data = await res.json();
    document.getElementById(respEl).innerText = "✅ Done! Job: " + (data.job_id || JSON.stringify(data));
  } catch (e) {
    document.getElementById(respEl).innerText = "❌ Error: " + e;
  }
}

// Trim
document.getElementById("trim_btn").addEventListener("click", ()=>{
  const fd = new FormData();
  fd.append("video", document.getElementById("trim_video").files[0]);
  fd.append("start", document.getElementById("trim_start").value);
  fd.append("end", document.getElementById("trim_end").value);
  postForm("/video-trim", fd, "trim_resp");
});

// Merge
document.getElementById("merge_btn").addEventListener("click", ()=>{
  const fd = new FormData();
  for(let f of document.getElementById("merge_videos").files) fd.append("videos", f);
  postForm("/video-merge", fd, "merge_resp");
});

// Subtitles
document.getElementById("subs_btn").addEventListener("click", ()=>{
  const fd = new FormData();
  fd.append("video", document.getElementById("subs_video").files[0]);
  fd.append("subtitles", document.getElementById("subs_text").value);
  fd.append("lang", document.getElementById("subs_lang").value);
  postForm("/video-add-subs", fd, "subs_resp");
});

// Background Music
document.getElementById("bg_btn").addEventListener("click", ()=>{
  const fd = new FormData();
  fd.append("video", document.getElementById("bg_video").files[0]);
  fd.append("audio", document.getElementById("bg_audio").files[0]);
  postForm("/video-add-music", fd, "bg_resp");
});

// Watermark
document.getElementById("wm_btn").addEventListener("click", ()=>{
  const fd = new FormData();
  fd.append("video", document.getElementById("wm_video").files[0]);
  fd.append("logo", document.getElementById("wm_logo").files[0]);
  postForm("/video-watermark", fd, "wm_resp");
});

// Filters
document.getElementById("fx_btn").addEventListener("click", ()=>{
  const fd = new FormData();
  fd.append("video", document.getElementById("fx_video").files[0]);
  fd.append("filter", document.getElementById("fx_filter").value);
  postForm("/video-fx", fd, "fx_resp");
});

// Aspect Ratio
document.getElementById("ar_btn").addEventListener("click", ()=>{
  const fd = new FormData();
  fd.append("video", document.getElementById("ar_video").files[0]);
  fd.append("ratio", document.getElementById("ar_select").value);
  postForm("/video-aspect", fd, "ar_resp");
});
