const API_BASE = "https://visora.onrender.com"; 
const GPT_API = "https://api.openai.com/v1/chat/completions"; // ChatGPT API

// ⚠️ Replace with your API Key
const GPT_KEY = "YOUR_OPENAI_API_KEY";

// Helper for GPT
async function callGPT(prompt) {
  try {
    const res = await fetch(GPT_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GPT_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "❌ Error generating text";
  } catch (err) {
    console.error(err);
    return "❌ API Error";
  }
}

// Script Generator
document.getElementById("script_btn").addEventListener("click", async ()=>{
  const topic = document.getElementById("script_topic").value;
  const tone = document.getElementById("script_tone").value;
  document.getElementById("script_resp").innerText = "⏳ Generating...";
  const reply = await callGPT(`Write a ${tone} video script about: ${topic}`);
  document.getElementById("script_resp").innerText = reply;
});

// Captions
document.getElementById("caption_btn").addEventListener("click", async ()=>{
  const topic = document.getElementById("caption_topic").value;
  document.getElementById("caption_resp").innerText = "⏳ Generating...";
  const reply = await callGPT(`Give me 5 catchy captions/hooks for a video about: ${topic}`);
  document.getElementById("caption_resp").innerText = reply;
});

// SEO
document.getElementById("seo_btn").addEventListener("click", async ()=>{
  const topic = document.getElementById("seo_topic").value;
  document.getElementById("seo_resp").innerText = "⏳ Generating...";
  const reply = await callGPT(`Generate YouTube title, description and hashtags for: ${topic}`);
  document.getElementById("seo_resp").innerText = reply;
});

// Thumbnails
document.getElementById("thumb_btn").addEventListener("click", async ()=>{
  const topic = document.getElementById("thumb_topic").value;
  document.getElementById("thumb_resp").innerText = "⏳ Generating...";
  const reply = await callGPT(`Suggest 3 thumbnail text ideas for: ${topic}`);
  document.getElementById("thumb_resp").innerText = reply;
});
