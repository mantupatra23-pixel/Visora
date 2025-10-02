const API_BASE = "https://visora.onrender.com";

// Load voices from backend
async function loadVoices() {
  try {
    const res = await fetch(`${API_BASE}/voices`);
    const data = await res.json();
    const grid = document.getElementById("voiceGrid");
    grid.innerHTML = "";

    data.voices.forEach(v => {
      let card = document.createElement("div");
      card.className = "voice-card";
      card.innerHTML = `
        <h4>${v.name}</h4>
        <p class="muted">${v.lang} · ${v.gender}</p>
        <audio controls src="${v.preview_url}"></audio>
        <label>Pitch</label>
        <input type="range" min="0.5" max="2" step="0.1" value="1" 
               oninput="previewVoice('${v.id}', this.value, 1)">
        <label>Speed</label>
        <input type="range" min="0.5" max="2" step="0.1" value="1" 
               oninput="previewVoice('${v.id}', 1, this.value)">
        <button onclick="selectVoice('${v.id}')" class="btn primary mt">Use This Voice</button>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

// Preview with pitch/speed
async function previewVoice(id, pitch, speed) {
  try {
    const res = await fetch(`${API_BASE}/voice-preview/${id}?pitch=${pitch}&speed=${speed}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    new Audio(url).play();
  } catch (err) {
    console.error(err);
  }
}

// Select voice for project
function selectVoice(id) {
  alert("✅ Voice selected: " + id);
}

// Clone voice
document.getElementById("clone_btn").onclick = async () => {
  const name = document.getElementById("clone_name").value;
  const file = document.getElementById("clone_file").files[0];
  const fd = new FormData();
  fd.append("name", name);
  fd.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/clone-voice`, { method: "POST", body: fd });
    const data = await res.json();
    document.getElementById("clone_resp").innerText = "✅ Voice cloned: " + data.id;
    loadVoices();
  } catch (err) {
    console.error(err);
  }
};

// Init
loadVoices();
