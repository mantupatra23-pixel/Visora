const API_BASE = "https://visora.onrender.com";

// Razorpay Order
document.getElementById("rz_btn").onclick = async () => {
  const amount = document.getElementById("rz_amount").value;
  if (!amount) return alert("Enter amount");
  try {
    const res = await fetch(`${API_BASE}/payments/razorpay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: "demo@visora.com", amount })
    });
    const data = await res.json();
    document.getElementById("rz_resp").innerText = "Order created: " + JSON.stringify(data);
  } catch (err) {
    console.error(err);
    document.getElementById("rz_resp").innerText = "❌ Error creating Razorpay order";
  }
};

// PayPal Order
document.getElementById("pp_btn").onclick = async () => {
  const amount = document.getElementById("pp_amount").value;
  if (!amount) return alert("Enter amount");
  try {
    const res = await fetch(`${API_BASE}/payments/paypal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: "demo@visora.com", amount })
    });
    const data = await res.json();
    document.getElementById("pp_resp").innerText = "Order created: " + JSON.stringify(data);
  } catch (err) {
    console.error(err);
    document.getElementById("pp_resp").innerText = "❌ Error creating PayPal order";
  }
};

// Upgrade Plan
async function upgradePlan(plan) {
  try {
    const res = await fetch(`${API_BASE}/upgrade-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: "demo@visora.com", plan })
    });
    const data = await res.json();
    alert("✅ Plan upgraded to " + plan);
  } catch (err) {
    console.error(err);
  }
}
