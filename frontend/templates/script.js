// ---------- CONFIG ----------
const API_URL = "https://visora.onrender.com"; // ← backend ka live URL (Render)

// ---------- ELEMENTS ----------
const generateBtn = document.getElementById("generateBtn");
const createBtn = document.getElementById("createBtn");
const statusBox = document.getElementById("status");
const scriptInput = document.getElementById("scriptInput");
const voiceSelect = document.getElementById("voiceSelect");
const templateSelect = document.getElementById("templateSelect");
const bgMusicSelect = document.getElementById("bgMusicSelect");

// ---------- UPDATE STATUS ----------
function updateStatus(msg, type = "info") {
  statusBox.innerHTML = `Status: ${
    type === "error" ? "⚠️" : type === "success" ? "✅" : "ℹ️"
  } ${msg}`;
}

// ---------- GENERATE SCRIPT (AI) ----------
generateBtn.addEventListener("click", async () => {
  const prompt = scriptInput.value.trim();
  if (!prompt) {
    updateStatus("Please enter a topic first!", "error");
    return;
  }

  updateStatus("Generating script... please wait ⏳");

  try {
    const res = await fetch(`${API_URL}/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: prompt,
        tone: "helpful",
        lang: "hi",
      }),
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    scriptInput.value = data.reply || "AI didn’t return a response.";
    updateStatus("Script generated successfully ✅", "success");
  } catch (err) {
    updateStatus(`Network error: ${err.message}`, "error");
  }
});

// ---------- CREATE VIDEO ----------
createBtn.addEventListener("click", async () => {
  const script = scriptInput.value.trim();
  if (!script) {
    updateStatus("Please generate or write a script first!", "error");
    return;
  }

  updateStatus("Creating video... ⏳");

  try {
    const formData = new FormData();
    formData.append("title", "AI Generated Video");
    formData.append("script", script);
    formData.append("template", templateSelect.value);
    formData.append("quality", "HD");
    formData.append("length_type", "short");
    formData.append("lang", "hi");
    formData.append("bg_music", bgMusicSelect.value);

    const res = await fetch(`${API_URL}/generate_video`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();

    if (data.status === "queued" || data.job_id) {
      updateStatus("Video generation started... 🚀", "success");
    } else {
      updateStatus("Failed to start video generation.", "error");
    }
  } catch (err) {
    updateStatus(`Network error: ${err.message}`, "error");
  }
});
