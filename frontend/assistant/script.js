const API_BASE = "https://visora.onrender.com";

// Manual Ask
document.getElementById("as_submit").onclick = async () => {
  const text = document.getElementById("as_input").value;
  const tone = document.getElementById("as_tone").value;
  if (!text) return alert("Enter a prompt first!");

  document.getElementById("as_reply").innerText = "⏳ Thinking...";

  try {
    const res = await fetch(`${API_BASE}/assistant-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text, tone })
    });
    const data = await res.json();
    document.getElementById("as_reply").innerText = data.reply || "⚠️ No reply";
  } catch (err) {
    console.error(err);
    document.getElementById("as_reply").innerText = "❌ Error contacting assistant.";
  }
};

// Quick Prompt
async function quickPrompt(prompt) {
  document.getElementById("as_input").value = prompt;
  document.getElementById("as_submit").click();
}
