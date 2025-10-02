const API_BASE = "https://visora.onrender.com";

const templatesGrid = document.getElementById("templatesGrid");
const searchBox = document.getElementById("searchBox");
const categoryFilter = document.getElementById("categoryFilter");
const modal = document.getElementById("previewModal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalVideo = document.getElementById("modalVideo");
const useTemplateBtn = document.getElementById("useTemplateBtn");

let templates = [];

// Fetch templates from backend
async function loadTemplates() {
  try {
    const res = await fetch(`${API_BASE}/templates/all`);
    templates = await res.json();
    renderTemplates(templates);
  } catch (err) {
    console.error(err);
    templatesGrid.innerHTML = "<div class='muted'>❌ Failed to load templates</div>";
  }
}

function renderTemplates(list) {
  templatesGrid.innerHTML = "";
  list.forEach(t => {
    const card = document.createElement("div");
    card.className = "template-card";
    card.innerHTML = `
      <img src="${t.thumbnail}" alt="${t.name}">
      <h4>${t.name}</h4>
      <p>${t.category}</p>
    `;
    card.addEventListener("click", ()=>openPreview(t));
    templatesGrid.appendChild(card);
  });
}

// Open modal preview
function openPreview(template) {
  modalTitle.innerText = template.name;
  modalVideo.src = template.preview_url;
  modal.classList.remove("hidden");

  useTemplateBtn.onclick = ()=>{
    alert(`🎬 Template "${template.name}" selected! Redirecting to Create Video...`);
    window.location.href = "../create/index.html?template=" + encodeURIComponent(template.name);
  };
}

closeModal.onclick = ()=>modal.classList.add("hidden");

// Search & filter
searchBox.addEventListener("input", ()=>{
  const q = searchBox.value.toLowerCase();
  const filtered = templates.filter(t => t.name.toLowerCase().includes(q));
  renderTemplates(filtered);
});

categoryFilter.addEventListener("change", ()=>{
  const cat = categoryFilter.value;
  const filtered = cat==="all" ? templates : templates.filter(t=>t.category.toLowerCase()===cat);
  renderTemplates(filtered);
});

// Init
loadTemplates();
