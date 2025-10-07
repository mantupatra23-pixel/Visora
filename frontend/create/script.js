const API_BASE = "https://visora.onrender.com";

generateBtn.addEventListener("click", async () => {
  statusText.textContent = "Status: Generating AI Script...";
  const topic = document.getElementById("script").value;

  try {
    const res = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: topic })
    });

    const data = await res.json();
    if (data.script) {
      document.getElementById("script").value = data.script;
      statusText.textContent = "Status: Script generated ✅";
    } else {
      statusText.textContent = "Status: Error generating script ❌";
    }
  } catch (err) {
    statusText.textContent = "Status: Network error ⚠️";
  }
});

createBtn.addEventListener("click", async () => {
  statusText.textContent = "Status: Creating video...";
  try {
    const res = await fetch(`${API_BASE}/create-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        script: document.getElementById("script").value,
        voice: document.getElementById("voice").value,
        template: document.getElementById("template").value,
        music: document.getElementById("music").value
      })
    });

    const data = await res.json();
    if (data.status === "success") {
      statusText.textContent = "Status: Video created 🎉";
    } else {
      statusText.textContent = `Status: ${data.message || "Error creating video"}`;
    }
  } catch (err) {
    statusText.textContent = "Status: Network error ⚠️";
  }
});
