const API_BASE = "https://visora.onrender.com";

async function loadDashboard() {
  try {
    // Load profile
    const profile = await (await fetch(`${API_BASE}/profile/demo@visora.com`)).json();
    document.getElementById("userName").innerText = profile.name || "Demo User";
    document.getElementById("userPlan").innerText = "Plan: " + (profile.plan || "Free");
    document.getElementById("credits").innerText = profile.credits ?? "0";
    document.getElementById("videosCount").innerText = profile.videos ?? "0";
    document.getElementById("storage").innerText = profile.storage_used || "—";
    if (profile.photo) document.getElementById("profilePhoto").src = profile.photo;

    // Load trending templates
    const templates = await (await fetch(`${API_BASE}/templates/trending`)).json();
    const grid = document.getElementById("trendingGrid");
    grid.innerHTML = "";
    templates.forEach(t => {
      const div = document.createElement("div");
      div.className = "template-card";
      div.innerHTML = `<img src="${t.thumbnail}" alt="${t.name}"><h4>${t.name}</h4>`;
      grid.appendChild(div);
    });

    // Load recent jobs
    const jobs = await (await fetch(`${API_BASE}/gallery?user_email=demo@visora.com`)).json();
    const jobsBox = document.getElementById("recentJobs");
    jobsBox.innerHTML = jobs.map(j => `
      <div class="muted">${j.title} - ${j.status} - ${new Date(j.created_at).toLocaleString()}</div>
    `).join("") || "<div class='muted'>No jobs yet</div>";

  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
