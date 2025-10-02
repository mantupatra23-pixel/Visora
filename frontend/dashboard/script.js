const API_BASE = "https://visora.onrender.com";

window.onload = () => {
  loadProfile();
  loadCredits();
  loadJobs();
  loadTrending();
};

async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE}/profile/demo@visora.com`);
    const data = await res.json();
    document.getElementById("user_name").innerText = data.name || "Demo User";
    document.getElementById("user_plan").innerText = data.plan || "Free Plan";
    document.getElementById("profile_pic").src = data.photo || "../assets/user.png";
  } catch (e) { console.error(e); }
}

async function loadCredits() {
  try {
    const res = await fetch(`${API_BASE}/credits/demo@visora.com`);
    const data = await res.json();
    document.getElementById("credits").innerText = data.credits || 0;
  } catch (e) { console.error(e); }
}

async function loadJobs() {
  try {
    const res = await fetch(`${API_BASE}/jobs`);
    const data = await res.json();
    const el = document.getElementById("recentJobs");
    el.innerHTML = data.jobs.slice(0,5).map(j =>
      `<div class="muted">${j.id} - ${j.status} - ${new Date(j.created_at).toLocaleString()}</div>`
    ).join("");
  } catch (e) { console.error(e); }
}

async function loadTrending() {
  try {
    const res = await fetch(`${API_BASE}/templates/trending`);
    const arr = await res.json();
    const el = document.getElementById("trendingList");
    el.innerHTML = arr.map(t =>
      `<div class="template-item" onclick="previewTemplate('${t.preview_url}')">
        <img src="${t.thumbnail}" alt="${t.name}">
        <h4>${t.name}</h4>
      </div>`
    ).join("");
  } catch (e) { console.error(e); }
}

function previewTemplate(url) {
  alert("Preview template: " + url);
}
