// ✅ Backend API URL (Visora backend)
const API_BASE = "https://visora.onrender.com";

document.getElementById("createBtn").onclick = async () => {
  const title = document.getElementById("title").value.trim();
  const prompt = document.getElementById("prompt").value.trim();
  const voice = document.getElementById("voice").value;

  if (!prompt) return alert("⚠️ Please enter a prompt first!");

  const statusCard = document.getElementById("statusCard");
  const statusText = document.getElementById("statusText");
  statusCard.style.display = "block";
  statusText.innerText = "⏳ Creating video... please wait.";

  try {
    const res = await fetch(`${API_BASE}/create-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, prompt, voice })
    });

    const data = await res.json();

    if (!res.ok) {
      statusText.innerText = `❌ Error: ${data.error || JSON.stringify(data)}`;
      return;
    }

    statusText.innerText = `✅ Video Created Successfully!\n\nResponse:\n${JSON.stringify(data, null, 2)}`;
  } catch (err) {
    statusText.innerText = `🚫 Network or Backend Error:\n${err.message}`;
  }
};
