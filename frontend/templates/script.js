const API_BASE = "https://visora.onrender.com";
const grid = document.getElementById("templateGrid");
const modal = document.getElementById("previewModal");
const modalVideo = document.getElementById("modalVideo");
const modalTitle = document.getElementById("modalTitle");
const useBtn = document.getElementById("useTemplate");
const closeModal = document.getElementById("closeModal");

// Load templates
async function loadTemplates() {
  try {
    const res = await fetch(`${API_BASE}/templates`);
    const data = await res.json();
    renderTemplates(data.templates);
  } catch (err) {
    console.error(err);
  }
}

// Render templates grid
function renderTemplates(list) {
  grid.innerHTML = "";
  list.forEach(t => {
    let card = document.createElement("div");
    card.className = "template-card";
    card.innerHTML = `
      <img src="${t.thumbnail}" alt="${t.name}">
      <h4>${t.name}</h4>
    `;
    card.onclick = () => openPreview(t);
    grid.appendChild(card);
  });
}

// Open preview modal
function openPreview(t) {
  modal.classList.remove("hidden");
  modalTitle.innerText = t.name;
  modalVideo.src = t.preview_url;
  useBtn.onclick = () => {
    alert("✅ Template selected: " + t.name);
    modal.classList.add("hidden");
  };
}

// Close modal
closeModal.onclick = () => modal.classList.add("hidden");

// Search + Filter
document.getElementById("search").addEventListener("input", async (e) => {
  const q = e.target.value.toLowerCase();
  const res = await fetch(`${API_BASE}/templates?q=${q}`);
  const data = await res.json();
  renderTemplates(data.templates);
});
document.getElementById("filter").addEventListener("change", async (e) => {
  const cat = e.target.value;
  const res = await fetch(`${API_BASE}/templates?cat=${cat}`);
  const data = await res.json();
  renderTemplates(data.templates);
});

// Init
loadTemplates();
