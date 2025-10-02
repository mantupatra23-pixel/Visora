window.onload = function() {
  let grid = document.getElementById("templates-grid");
  let templates = [
    { title: "YouTube Intro", image: "https://via.placeholder.com/300x150?text=YouTube+Intro" },
    { title: "Business Promo", image: "https://via.placeholder.com/300x150?text=Business+Promo" },
    { title: "Instagram Reel", image: "https://via.placeholder.com/300x150?text=Instagram+Reel" },
    { title: "Festival Greeting", image: "https://via.placeholder.com/300x150?text=Festival+Greeting" }
  ];

  templates.forEach(tt => {
    let card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<img src="${tt.image}" alt="${tt.title}"><p>${tt.title}</p>`;
    card.onclick = () => openPreview(tt);
    grid.appendChild(card);
  });
};

// Modal Logic
function openPreview(template) {
  document.getElementById("previewModal").style.display = "flex";
  document.getElementById("templateTitle").innerText = template.title;
  document.getElementById("templateImage").src = template.image;
}

function closeModal() {
  document.getElementById("previewModal").style.display = "none";
}

function useTemplate() {
  alert("Template applied!");
  closeModal();
}

document.querySelector(".close").onclick = closeModal;
