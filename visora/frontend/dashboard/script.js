const API_BASE = "https://visora.onrender.com";

// Load user profile
async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE}/profile`);
    const data = await res.json();
    document.getElementById("userName").innerText = data.name || "User";
    document.getElementById("userPlan").innerText = "Plan: " + (data.plan || "Free");
    document.getElementById("credits").innerText = data.credits || 0;
    if (data.photo_url) document.getElementById("profilePic").src = data.photo_url;
  } catch (err) {
    console.error(err);
  }
}

// Load notifications
async function loadNotifications() {
  try {
    const res = await fetch(`${API_BASE}/notifications`);
    const data = await res.json();
    const ul = document.getElementById("notifications");
    ul.innerHTML = "";
    data.forEach(n => {
      let li = document.createElement("li");
      li.innerText = n.message;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// Load recent jobs
async function loadJobs() {
  try {
    const res = await fetch(`${API_BASE}/jobs`);
    const data = await res.json();
    const ul = document.getElementById("recentJobs");
    ul.innerHTML = "";
    data.jobs.forEach(j => {
      let li = document.createElement("li");
      li.innerText = `${j.id} - ${j.status}`;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// Load trending templates
async function loadTrending() {
  try {
    const res = await fetch(`${API_BASE}/templates/trending`);
    const data = await res.json();
    const grid = document.getElementById("trendingGrid");
    grid.innerHTML = "";
    data.forEach(t => {
      let card = document.createElement("div");
      card.className = "template-card";
      card.innerHTML = `<img src="${t.thumbnail}" style="width:100%;border-radius:6px;" /><div>${t.name}</div>`;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

// Run all
loadProfile();
loadNotifications();
loadJobs();
loadTrending();
