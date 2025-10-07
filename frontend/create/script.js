const API_BASE = "https://visora.onrender.com";

const statusText = document.getElementById("status");
const generateBtn = document.getElementById("generate");
const createBtn = document.getElementById("create");

generateBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  statusText.textContent = "✨ Status: Generating AI Script...";
  const topic = document.getElementById("script").value.trim();

  if (!topic) {
    statusText.textContent = "⚠️ Please enter a topic first!";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: topic }),
    });

    if (!res.ok) {
      throw new Error("API not responding");
    }

    const data = await res.json();

    if (data.script) {
      document.getElementById("script").value = data.script;
      statusText.textContent = "✅ Status: Script generated successfully!";
    } else {
      statusText.textContent = "❌ Status: Failed to generate script.";
    }
  } catch (err) {
    statusText.textContent = `⚠️ Network error: ${err.message}`;
  }
});

createBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  statusText.textContent = "🚀 Status: Creating video, please wait...";

  const script = document.getElementById("script").value.trim();
  if (!script) {
    statusText.textContent = "⚠️ Please generate a script first!";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/create-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        script: script,
        voice: document.getElementById("voice").value,
        template: document.getElementById("template").value,
        music: document.getElementById("music").value,
      }),
    });

    if (!res.ok) {
      throw new Error("Server not responding");
    }

    const data = await res.json();

    if (data.status === "success") {
      statusText.textContent = "🎉 Video created successfully!";
    } else {
      statusText.textContent = `❌ Error: ${data.message || "Failed to create video."}`;
    }
  } catch (err) {
    statusText.textContent = `⚠️ Network error: ${err.message}`;
  }
});
