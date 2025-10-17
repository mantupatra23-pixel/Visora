const API_BASE = "https://visora.onrender.com";

// Load templates
async function loadTemplates(category="all") {
  try {
    const res = await fetch(`${API_BASE}/templates`);
    let data = await res.json();

    if (category !== "all") {
      data = data.filter(t => t.category === category);
    }

    const grid = document.getElementById("templateGrid");
    grid.innerHTML = "";
    data.forEach(t => {
      let card = document.createElement("div");
      card.className = "template-card";
      card.innerHTML = `
        <img src="${t.thumbnail}" alt="${t.name}">
        <div>${t.name}</div>
      `;
      card.onclick = () => openPreview(t);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

// Open Preview Modal
function openPreview(template) {
  document.getElementById("modalTitle").innerText = template.name;
  document.getElementById("modalVideo").src = template.preview_url;
  document.getElementById("previewModal").classList.remove("hidden");

  document.getElementById("useTemplate").onclick = () => {
    window.location.href = `../create/index.html?template=${template.id}`;
  };
}

// Close modal
document.getElementById("closeModal").onclick = () => {
  document.getElementById("previewModal").classList.add("hidden");
};

// Filter
document.getElementById("filterCategory").addEventListener("change", (e) => {
  loadTemplates(e.target.value);
});

// Run
loadTemplates();
