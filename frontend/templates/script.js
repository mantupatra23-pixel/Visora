const templates = [
  { name: "Motivation Reel", img: "https://picsum.photos/200/120?1", category: "ads" },
  { name: "Educational Explainer", img: "https://picsum.photos/200/120?2", category: "education" },
  { name: "Gaming Intro", img: "https://picsum.photos/200/120?3", category: "gaming" },
  { name: "Meme Clip", img: "https://picsum.photos/200/120?4", category: "meme" },
  { name: "Diwali Special", img: "https://picsum.photos/200/120?5", category: "festival" }
];

const grid = document.getElementById("templateGrid");
const searchBox = document.getElementById("searchBox");
const filter = document.getElementById("categoryFilter");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");

function renderTemplates(list) {
  grid.innerHTML = "";
  list.forEach(t => {
    const img = document.createElement("img");
    img.src = t.img;
    img.alt = t.name;
    img.onclick = () => openModal(t);
    grid.appendChild(img);
  });
}

function openModal(template) {
  modalImg.src = template.img;
  modalTitle.innerText = template.name;
  modalCategory.innerText = "Category: " + template.category;
  modal.classList.remove("hidden");
}

document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");

searchBox.addEventListener("input", () => {
  const term = searchBox.value.toLowerCase();
  const filtered = templates.filter(t => t.name.toLowerCase().includes(term));
  renderTemplates(filtered);
});

filter.addEventListener("change", () => {
  const cat = filter.value;
  const filtered = (cat === "all") ? templates : templates.filter(t => t.category === cat);
  renderTemplates(filtered);
});

renderTemplates(templates);
