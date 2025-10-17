window.onload = function() {
  let grid = document.getElementById("gallery-grid");
  let galleryItems = [
    { title: "YouTube Intro", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { title: "Promo Ad", url: "https://www.w3schools.com/html/movie.mp4" },
    { title: "Reel Highlight", url: "https://www.w3schools.com/html/mov_bbb.mp4" }
  ];

  galleryItems.forEach(item => {
    let card = document.createElement("div");
    card.className = "card";

    let video = document.createElement("video");
    video.src = item.url;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;

    let caption = document.createElement("p");
    caption.innerText = item.title;

    card.onclick = () => openPreview(item);

    card.appendChild(video);
    card.appendChild(caption);
    grid.appendChild(card);
  });
};

// Modal logic
function openPreview(item) {
  document.getElementById("previewModal").style.display = "flex";
  document.getElementById("previewVideo").src = item.url;
  document.getElementById("previewTitle").innerText = item.title;
}

document.querySelector(".close").onclick = () => {
  document.getElementById("previewModal").style.display = "none";
};
