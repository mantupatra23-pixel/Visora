const API_BASE = "https://visora.onrender.com";

// Sample voices (later connect backend for 1000+)
const voices = [
  { id:1, name:"Ravi (Male, Hindi)", category:"male", sample:"https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav" },
  { id:2, name:"Anita (Female, English)", category:"female", sample:"https://www2.cs.uic.edu/~i101/SoundFiles/taunt.wav" },
  { id:3, name:"Child Voice (Cute)", category:"child", sample:"https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg.wav" },
  { id:4, name:"Amitabh-like", category:"celebrity", sample:"https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav" }
];

// Load voices
function loadVoices(list) {
  const grid = document.getElementById("voicesList");
  grid.innerHTML = "";
  list.forEach(v => {
    const div = document.createElement("div");
    div.className = "voice-card";
    div.innerHTML = `
      <h4>${v.name}</h4>
      <audio controls src="${v.sample}"></audio>
      <div class="voice-controls">
        <label>Pitch</label>
        <input type="range" min="0.5" max="2" step="0.1" value="1" onchange="setPitch(this, ${v.id})"/>
        <label>Speed</label>
        <input type="range" min="0.5" max="2" step="0.1" value="1" onchange="setSpeed(this, ${v.id})"/>
      </div>
      <button class="btn primary" onclick="useVoice(${v.id})">Use Voice</button>
    `;
    grid.appendChild(div);
  });
}

// Voice Pitch/Speed (demo only, real backend apply later)
function setPitch(slider, id) {
  console.log("Pitch changed", id, slider.value);
}
function setSpeed(slider, id) {
  console.log("Speed changed", id, slider.value);
}

// Use Voice
async function useVoice(id) {
  alert("✅ Using Voice: " + id);
  // send to backend later
}

// Search & Filter
document.getElementById("searchVoice").addEventListener("input", filterVoices);
document.getElementById("voiceCategory").addEventListener("change", filterVoices);

function filterVoices() {
  const val = document.getElementById("searchVoice").value.toLowerCase();
  const cat = document.getElementById("voiceCategory").value;
  const filtered = voices.filter(v =>
    (v.name.toLowerCase().includes(val)) &&
    (!cat || v.category===cat)
  );
  loadVoices(filtered);
}

// Clone Voice
document.getElementById("cloneBtn").addEventListener("click", async ()=>{
  const name = document.getElementById("voiceName").value;
  const file = document.getElementById("voiceFile").files[0];
  if(!name || !file) return alert("⚠️ Name + File required");

  const fd = new FormData();
  fd.append("voice_name", name);
  fd.append("file", file);

  document.getElementById("cloneResp").innerText = "Uploading...";
  try {
    const res = await fetch(`${API_BASE}/clone-voice`, { method:"POST", body:fd });
    const data = await res.json();
    document.getElementById("cloneResp").innerText = "✅ Voice cloned: " + data.voice_id;
  } catch (err) {
    document.getElementById("cloneResp").innerText = "❌ Error cloning voice";
  }
});

// Init
loadVoices(voices);
