document.getElementById("createVideoBtn").addEventListener("click", async () => {
  const script = document.getElementById("scriptBox").value;
  const voice = document.getElementById("voiceSelect").value;
  const template = document.getElementById("templateSelect").value;
  const music = document.getElementById("musicSelect").value;

  document.getElementById("statusText").textContent = "Processing video... 🎥";

  try {
    const res = await fetch("/create/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "AI Video", script, voice, template, music })
    });

    const data = await res.json();
    if (data.status === "success") {
      document.getElementById("statusText").textContent = data.message;
      document.getElementById("videoBox").classList.remove("hidden");
      document.getElementById("previewVideo").src = data.url;
    } else {
      document.getElementById("statusText").textContent = "❌ " + data.error;
    }
  } catch (error) {
    document.getElementById("statusText").textContent = "⚠️ Network error!";
  }
});
