const API_BASE = "https://visora.onrender.com"; // backend live

async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE}/profile/demo@visora.com`);
    const data = await res.json();
    document.getElementById("profileName").innerText = data.name || "Demo User";
    document.getElementById("profileEmail").innerText = data.email || "demo@visora.com";
    document.getElementById("profilePlan").innerText = data.plan || "Free";
    document.getElementById("profileCredits").innerText = data.credits || "0";
    document.getElementById("profileCountry").innerText = data.country || "India";
    if (data.photo_url) {
      document.getElementById("profilePhoto").src = data.photo_url;
    }
  } catch (err) {
    console.error(err);
  }
}

document.getElementById("refreshBtn").onclick = loadProfile;

// Edit Profile Modal
const modal = document.getElementById("editModal");
document.getElementById("editBtn").onclick = () => modal.style.display = "flex";
document.querySelector(".close").onclick = () => modal.style.display = "none";

document.getElementById("saveEdit").onclick = async () => {
  const name = document.getElementById("editName").value;
  const country = document.getElementById("editCountry").value;
  const photo = document.getElementById("editPhoto").files[0];
  const fd = new FormData();
  fd.append("user_email", "demo@visora.com");
  if (name) fd.append("name", name);
  if (country) fd.append("country", country);
  if (photo) fd.append("photo", photo);

  try {
    const res = await fetch(`${API_BASE}/profile/update`, {
      method: "POST",
      body: fd
    });
    const data = await res.json();
    alert("✅ Profile updated!");
    modal.style.display = "none";
    loadProfile();
  } catch (err) {
    console.error(err);
  }
};

loadProfile();
