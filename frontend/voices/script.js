const voices = [
  { name: "Aarav (Male, Hindi)", lang: "hi", preview: "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav" },
  { name: "Ananya (Female, Hindi)", lang: "hi", preview: "https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav" },
  { name: "John (Male, English)", lang: "en", preview: "https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav" },
  { name: "Emily (Female, English)", lang: "en", preview: "https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther60.wav" },
];

const grid = document.getElementById("voicesGrid");
const search = document.getElementById("searchVoice");
const filter = document.getElementById("langFilter");

function renderVoices(list) {
  grid.innerHTML = "";
  list.forEach(v => {
    const card = document.createElement("div");
    card.className = "voice-card";
    card.innerHTML = `
      <h3>${v.name}</h3>
      <p>Language: ${v.lang.toUpperCase()}</p>
      <div class="controls">
        <button onclick="playVoice('${v.preview}')">▶ Play</button>
        <label>Pitch</label>
        <input type="range" min="0.5" max="2" value="1" step="0.1" class="range-slider" onchange="setPitch(this.value)">
      </div>
    `;
    grid.appendChild(card);
  });
}

let audio = new Audio();
let pitch = 1;

function playVoice(src) {
  audio.pause();
  audio = new Audio(src);
  audio.playbackRate = pitch;
  audio.play();
}

function setPitch(val) {
  pitch = parseFloat(val);
  if (!audio.paused) {
    audio.playbackRate = pitch;
  }
}

search.addEventListener("input", () => {
  const term = search.value.toLowerCase();
  const filtered = voices.filter(v => v.name.toLowerCase().includes(term));
  renderVoices(filtered);
});

filter.addEventListener("change", () => {
  const lang = filter.value;
  const filtered = (lang === "all") ? voices : voices.filter(v => v.lang === lang);
  renderVoices(filtered);
});

renderVoices(voices);
