const API_BASE = "https://visora.onrender.com";

// Sample template data (later connect API)
const templates = [
  { id:1, title:"Motivation Reel", category:"motivation", thumbnail:"https://placehold.co/300x200", video:"https://samplelib.com/lib/preview/mp4/sample-5s.mp4" },
  { id:2, title:"Gaming Montage", category:"gaming", thumbnail:"https://placehold.co/300x200?text=Gaming", video:"https://samplelib.com/lib/preview/mp4/sample-10s.mp4" },
  { id:3, title:"Business Pitch", category:"business", thumbnail:"https://placehold.co/300x200?text=Business", video:"https://samplelib.com/lib/preview/mp4/sample-15s.mp4" },
  { id:4, title:"Wedding Intro", category:"wedding", thumbnail:"https://placehold.co/300x200?text=Wedding", video:"https://samplelib.com/lib/preview/mp4/sample-30s.mp4" }
];

// Load templates
function loadTemplates(list) {
  const grid = document.getElementById("templatesGrid");
  grid.innerHTML = "";
  list.forEach(t => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${t.thumbnail}" alt="${t.title}" onclick="openPreview(${t.id})" />
      <h4>${t.title}</h4>
      <small class="muted">${t.category}</small>
    `;
    grid.appendChild(card);
  });
}

// Preview Modal
function openPreview(id) {
  const t = templates.find(x=>x.id===id);
  document.getElementById("previewModal").classList.remove("hidden");
  document.getElementById("templateTitle").innerText = t.title;
  document.getElementById("templatePreviewVideo").src = t.video;
  document.getElementById("useTemplateBtn").onclick = () => useTemplate(t.id);
}

document.getElementById("closeModal").onclick = () => {
  document.getElementById("previewModal").classList.add("hidden");
};

// Use Template (connect to backend)
async function useTemplate(id) {
  alert("✅ Using template: " + id);
  // call API → create video from template
  try {
    const res = await fetch(`${API_BASE}/create-template-video`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ template_id:id, user_email:"demo@visora.com" })
    });
    const data = await res.json();
    console.log(data);
    alert("🎬 Video job started! Job ID: " + data.job_id);
  } catch (err) {
    console.error(err);
  }
}

// Search + Filter
document.getElementById("searchBox").addEventListener("input", e=>{
  const val = e.target.value.toLowerCase();
  const cat = document.getElementById("categoryFilter").value;
  const filtered = templates.filter(t=>
    (t.title.toLowerCase().includes(val)) &&
    (!cat || t.category===cat)
  );
  loadTemplates(filtered);
});

document.getElementById("categoryFilter").addEventListener("change", ()=>{
  const val = document.getElementById("searchBox").value.toLowerCase();
  const cat = document.getElementById("categoryFilter").value;
  const filtered = templates.filter(t=>
    (t.title.toLowerCase().includes(val)) &&
    (!cat || t.category===cat)
  );
  loadTemplates(filtered);
});

// Init
loadTemplates(templates);
