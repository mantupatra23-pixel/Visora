const API_BASE = "https://visora.onrender.com";

// Generate Video
document.getElementById("generateBtn").addEventListener("click", async () => {
  const btn = document.getElementById("generateBtn");
  btn.disabled = true;
  btn.innerText = "Generating...";

  const fd = new FormData();
  fd.append("user_email", "demo@visora.com");
  fd.append("title", document.getElementById("title").value);
  fd.append("script", document.getElementById("script").value);
  fd.append("template", document.getElementById("template").value);
  fd.append("quality", document.getElementById("quality").value);
  fd.append("lang", document.getElementById("lang").value);
  fd.append("length_type", document.getElementById("length").value);

  // files
  for (let f of document.getElementById("images").files) fd.append("characters", f);
  for (let f of document.getElementById("voices").files) fd.append("character_voice_files", f);
  const bg = document.getElementById("bgmusic").files[0];
  if (bg) fd.append("bg_music_file", bg);

  try {
    const res = await fetch(`${API_BASE}/generate_video`, { method:"POST", body: fd });
    const data = await res.json();
    document.getElementById("generate_resp").innerText = "🎬 Video generation started! Job ID: " + data.job_id;
  } catch (e) {
    document.getElementById("generate_resp").innerText = "❌ Error: " + e;
  }

  btn.disabled = false;
  btn.innerText = "⚡ Generate Video";
});

// Auto-fill sample
document.getElementById("autoFillBtn").addEventListener("click", () => {
  document.getElementById("title").value = "Motivation AI Short";
  document.getElementById("script").value = "C1: Keep moving forward. C2: Success follows effort.";
  document.getElementById("template").value = "Motivation";
});

// Assistant (ChatGPT integration)
document.getElementById("askAssistant").addEventListener("click", async () => {
  const q = document.getElementById("assistant_input").value;
  const replyBox = document.getElementById("assistant_reply");
  replyBox.innerText = "Thinking...";
  try {
    const res = await fetch(`${API_BASE}/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: q })
    });
    const data = await res.json();
    replyBox.innerText = data.reply || "No response";
  } catch (err) {
    replyBox.innerText = "Error connecting to assistant.";
  }
});
