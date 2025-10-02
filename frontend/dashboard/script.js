const API_BASE = "https://visora.onrender.com";

// Fake data (replace with API later)
document.getElementById("userCredits").innerText = "Credits: 120";
document.getElementById("userPlan").innerText = "Plan: Pro";
document.getElementById("totalVideos").innerText = "14";
document.getElementById("storageUsed").innerText = "1.2 GB";

// Trending templates
const trending = [
  { name: "Motivation", img: "https://picsum.photos/200/100?1" },
  { name: "Promo", img: "https://picsum.photos/200/100?2" },
  { name: "Explainer", img: "https://picsum.photos/200/100?3" },
  { name: "Cinematic", img: "https://picsum.photos/200/100?4" }
];

const grid = document.getElementById("trendingGrid");
trending.forEach(t => {
  const img = document.createElement("img");
  img.src = t.img;
  img.title = t.name;
  img.onclick = () => alert(`Template selected: ${t.name}`);
  grid.appendChild(img);
});

// Jobs auto-refresh
async function loadJobs() {
  try {
    const res = await fetch(`${API_BASE}/jobs`);
    const data = await res.json();
    const list = document.getElementById("jobsList");
    list.innerHTML = "";
    data.jobs.forEach(j => {
      const li = document.createElement("li");
      li.innerText = `${j.id} - ${j.status}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}
setInterval(loadJobs, 10000);
