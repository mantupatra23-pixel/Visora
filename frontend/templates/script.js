const API_BASE = "https://visora.onrender.com";

window.onload = () => {
  loadTemplates();
  document.getElementById("searchBox").addEventListener("input", loadTemplates);
  document.getElementById("categoryFilter").addEventListener("change", loadTemplates);
};

async function loadTemplates() {
  try {
    const res = await fetch(`${API_BASE}/templates/all`);
    const arr = await res.json();
    const search = document.getElementById("searchBox").value.toLowerCase();
    const cat = document.getElementById("categoryFilter").value;

    const el = document.getElementById("templateGrid");
    el.innerHTML = arr
      .filter(t => (!search || t.name.toLowerCase().includes(search)) &&
                   (!cat || t.category.toLowerCase()===cat))
      .map(t =>
        `<div class="template-item" onclick="openPreview('${t.name}','${t.preview_url}')">
          <img src="${t.thumbnail}" alt="${t.name}">
          <h4>${t.name}</h4>
        </div>`
      ).join("") || "<div>No templates found</div>";
  } catch (e) { console.error(e); }
}

function openPreview(name, url) {
  document.getElementById("previewTitle").innerText = name;
  const video = document.getElementById("previewVideo");
  video.src = url;
  document.getElementById("previewModal").classList.remove("hidden");
  document.getElementById("useTemplateBtn").onclick = () => useTemplate(name);
}

function closePreview() {
  document.getElementById("previewModal").classList.add("hidden");
}

function useTemplate(name) {
  alert("Template selected: " + name);
  closePreview();
}
