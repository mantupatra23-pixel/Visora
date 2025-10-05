// ✅ Backend Connection
const API_BASE = "https://visora.onrender.com";  // Apna backend Render URL

// --------------- Script Generator ----------------
document.getElementById("as_submit").onclick = async () => {
  const text = document.getElementById("as_input").value.trim();
  const tone = document.getElementById("as_tone").value.trim() || "neutral";
  const replyBox = document.getElementById("as_reply");

  if (!text) return alert("⚠️ Enter a prompt first");
  replyBox.innerText = "🤖 Thinking...";

  try {
    const res = await fetch(`${API_BASE}/assistant/script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text, tone })
    });

    const data = await res.json();
    replyBox.innerText = data.reply || "⚠️ No reply from assistant";
  } catch (err) {
    replyBox.innerText = "❌ Error contacting assistant.";
  }
};


// --------------- Captions Generator ----------------
document.getElementById("captions_generate").onclick = async () => {
  const idea = document.getElementById("captions_input").value.trim();
  const replyBox = document.getElementById("captions_reply");

  if (!idea) return alert("⚠️ Enter an idea first");
  replyBox.innerText = "🤖 Thinking...";

  try {
    const res = await fetch(`${API_BASE}/assistant/captions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea })
    });

    const data = await res.json();
    replyBox.innerText = data.reply || "⚠️ No reply from captions generator";
  } catch (err) {
    replyBox.innerText = "❌ Error contacting captions API.";
  }
};


// --------------- SEO Generator ----------------
document.getElementById("seo_generate").onclick = async () => {
  const subject = document.getElementById("seo_input").value.trim();
  const replyBox = document.getElementById("seo_reply");

  if (!subject) return alert("⚠️ Enter a subject first");
  replyBox.innerText = "🤖 Generating SEO...";

  try {
    const res = await fetch(`${API_BASE}/assistant/seo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject })
    });

    const data = await res.json();
    replyBox.innerText = data.reply || "⚠️ No SEO result";
  } catch (err) {
    replyBox.innerText = "❌ Error contacting SEO API.";
  }
};


// --------------- Thumbnail Generator ----------------
document.getElementById("thumbnail_generate").onclick = async () => {
  const subject = document.getElementById("thumbnail_input").value.trim();
  const replyBox = document.getElementById("thumbnail_reply");

  if (!subject) return alert("⚠️ Enter a topic first");
  replyBox.innerText = "🤖 Creating thumbnail ideas...";

  try {
    const res = await fetch(`${API_BASE}/assistant/thumbnail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject })
    });

    const data = await res.json();
    replyBox.innerText = data.reply || "⚠️ No thumbnail ideas";
  } catch (err) {
    replyBox.innerText = "❌ Error contacting thumbnail API.";
  }
};
