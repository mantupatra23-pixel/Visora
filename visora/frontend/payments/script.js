const API_BASE = "https://visora.onrender.com";

// Load Profile
async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE}/profile`);
    const data = await res.json();
    document.getElementById("profile_name").innerText = data.name;
    document.getElementById("profile_email").innerText = data.email;
    document.getElementById("profile_plan").innerText = data.plan;
    document.getElementById("profile_credits").innerText = data.credits;
    if (data.photo_url) {
      document.getElementById("profile_pic").src = data.photo_url;
    }
  } catch (err) {
    console.error(err);
  }
}
loadProfile();

// Update Profile Pic
document.getElementById("btn_update_pic").addEventListener("click", async ()=>{
  const file = document.getElementById("upload_pic").files[0];
  if (!file) return alert("Select a picture!");
  const formData = new FormData();
  formData.append("photo", file);
  const res = await fetch(`${API_BASE}/update-photo`, { method: "POST", body: formData });
  const data = await res.json();
  alert("✅ Photo updated!");
  loadProfile();
});

// Refresh
document.getElementById("btn_refresh").addEventListener("click", loadProfile);

// Payments (stub integration)
document.getElementById("btn_pay_razor").addEventListener("click", async ()=>{
  const plan = document.getElementById("plan_select").value;
  document.getElementById("pay_resp").innerText = "⏳ Creating Razorpay order...";
  const res = await fetch(`${API_BASE}/create-order`, { 
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ plan })
  });
  const data = await res.json();
  document.getElementById("pay_resp").innerText = "✅ Order created: " + data.order_id;
});

document.getElementById("btn_pay_paypal").addEventListener("click", async ()=>{
  const plan = document.getElementById("plan_select").value;
  document.getElementById("pay_resp").innerText = "⏳ Redirecting to PayPal...";
  const res = await fetch(`${API_BASE}/create-paypal`, { 
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ plan })
  });
  const data = await res.json();
  window.location.href = data.redirect_url;
});
