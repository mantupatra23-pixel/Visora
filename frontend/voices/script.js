const API_BASE = "https://visora.onrender.com";
let allVoices = [];

window.onload = () => {
  loadVoices();
  document.getElementById("searchBox").addEventListener("input", filterVoices);
  document.getElementById("uploadBtn").onclick = uploadVoice;
};

async function loadVoices() {
  try {
    const res = await fetch(`${API_BASE}/voices/all`);
    allVoices = await res.json();
    renderVoices(allVoices);
  } catch (e) {
    console.error(e);
    document.getElementById("voicesGrid").innerHTML = "<p class='muted'>Failed to load voices.</p>";
  }
}

function renderVoices(voices) {
  const el = document.getElementById("voicesGrid");
  el.innerHTML = voices.map(v => `
    <div class="voice">
      <h4>${v.name} <span class="muted">(${v.gender}, ${v.lang})</span></h4>
      <div class="controls">
        <button onclick="previewVoice('${v.preview_url}')">▶️ Play</button>
        <label>Pitch</label><input type="range" min="-10" max="10" value="0" oninput="adjustVoice('${v.id}',this.value,'pitch')">
        <label>Speed</label><input type="range" min="50" max="150" value="100" oninput="adjustVoice('${v.id}',this.value,'speed')">
      </div>
    </div>
  `).join("");
}

function filterVoices(e) {
  const term = e.target.value.toLowerCase();
  const filtered = allVoices.filter(v => v.name.toLowerCase().includes(term) || v.lang.toLowerCase().includes(term));
  renderVoices(filtered);
}

function previewVoice(url) {
  const audio = new Audio(url);
  audio.play();
}

async function adjustVoice(id, value, type) {
  console.log(`Adjust ${type} for voice ${id} → ${value}`);
  // future: send to backend for live preview
}

async function uploadVoice() {
  const file = document.getElementById("voiceUpload").files[0];
  if (!file) return alert("Please upload an audio file");
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch(`${API_BASE}/voices/upload`, { method:"POST", body:fd });
    const j = await res.json();
    document.getElementById("uploadResp").innerText = "✅ Uploaded: " + j.status;
    await loadVoices();
  } catch (e) {
    document.getElementById("uploadResp").innerText = "❌ Upload failed";
  }
}
