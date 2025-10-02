window.onload = function() {
  let list = document.getElementById("voices-list");
  let voices = [
    { name: "Arjun", lang: "Hindi", style: "Casual", preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { name: "Maya", lang: "English", style: "Formal", preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { name: "Ravi", lang: "Hinglish", style: "Energetic", preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
  ];

  voices.forEach(v => {
    let card = document.createElement("div");
    card.className = "voice-card";

    let info = document.createElement("div");
    info.className = "voice-info";
    info.innerHTML = `<strong>${v.name}</strong> • ${v.lang} • ${v.style}`;

    let controls = document.createElement("div");
    let playBtn = document.createElement("button");
    playBtn.innerText = "▶️ Play";
    let audio = new Audio(v.preview);
    playBtn.onclick = () => audio.play();

    let pitch = document.createElement("input");
    pitch.type = "range";
    pitch.min = 0.5;
    pitch.max = 2;
    pitch.step = 0.1;
    pitch.value = 1;
    pitch.oninput = () => {
      audio.playbackRate = pitch.value;
    };

    let selectBtn = document.createElement("button");
    selectBtn.innerText = "✅ Select";
    selectBtn.onclick = () => alert(`${v.name} selected!`);

    controls.appendChild(playBtn);
    controls.appendChild(pitch);
    controls.appendChild(selectBtn);

    card.appendChild(info);
    card.appendChild(controls);
    list.appendChild(card);
  });
};
