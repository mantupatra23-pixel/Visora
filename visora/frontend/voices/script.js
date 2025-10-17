const API_BASE = "https://visora.onrender.com";

// Upload user voice
async function uploadVoice() {
  const file = document.getElementById("user_voice").files[0];
  if (!file) return alert("Upload an audio file");
  const fd = new FormData();
  fd.append("voice", file);
  try {
    const res = await fetch(`${API_BASE}/voices/upload`, { method: "POST", body: fd });
    const data = await res.json();
    document.getElementById("uv_resp").innerText = "✅ Uploaded! ID: " + data.voice_id;
  } catch (err) {
    console.error(err);
    document.getElementById("uv_resp").innerText = "❌ Error uploading";
  }
}

// Load voices from backend
async function loadVoices() {
  const gender = document.getElementById("voice_gender").value;
  const lang = document.getElementById("voice_lang").value;
  try {
    const res = await fetch(`${API_BASE}/voices?gender=${gender}&lang=${lang}`);
    const data = await res.json();
    renderVoices(data.voices || []);
  } catch (err) {
    console.error(err);
    document.getElementById("voicesList").innerHTML = "<li>Error loading voices</li>";
  }
}

// Render voices
function renderVoices(voices) {
  const ul = document.getElementById("voicesList");
  ul.innerHTML = "";
  voices.forEach(v => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${v.name} (${v.lang}, ${v.gender})</span>
      <div class="voice-controls">
        <button onclick="playVoice('${v.sample_url}')">▶ Play</button>
        <label>Pitch</label><input type="range" min="0.5" max="2" step="0.1" value="1" oninput="setPitch(this.value)">
        <label>Speed</label><input type="range" min="0.5" max="2" step="0.1" value="1" oninput="setSpeed(this.value)">
      </div>
    `;
    ul.appendChild(li);
  });
}

// Play preview voice
function playVoice(url) {
  const audio = new Audio(url);
  audio.play();
}

function setPitch(val) {
  console.log("Pitch set to", val);
}
function setSpeed(val) {
  console.log("Speed set to", val);
}

// Initial load
loadVoices();
