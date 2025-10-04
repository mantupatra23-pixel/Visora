const API_BASE = "https://visora.onrender.com";  // apna backend URL

// ---------------- Script Generator ---------------- //
document.getElementById("as_submit").onclick = async () => {
    const text = document.getElementById("as_input").value;
    const tone = document.getElementById("as_tone").value;
    if (!text) return alert("Enter a prompt first");

    document.getElementById("as_reply").innerText = "⏳ Thinking...";

    try {
        const res = await fetch(`${API_BASE}/assistant/script`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: text, tone })
        });
        const data = await res.json();
        document.getElementById("as_reply").innerText = data.reply || "⚠️ No reply";
    } catch (err) {
        document.getElementById("as_reply").innerText = "❌ Error contacting assistant.";
    }
};


// ---------------- Captions Generator ---------------- //
document.getElementById("captions_generate").onclick = async () => {
    const idea = document.getElementById("captions_input").value;
    if (!idea) return alert("Enter an idea first");

    document.getElementById("captions_reply").innerText = "⏳ Thinking...";

    try {
        const res = await fetch(`${API_BASE}/assistant/captions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idea })
        });
        const data = await res.json();
        document.getElementById("captions_reply").innerText = data.reply || "⚠️ No reply";
    } catch (err) {
        document.getElementById("captions_reply").innerText = "❌ Error contacting assistant.";
    }
};


// ---------------- SEO Generator ---------------- //
document.getElementById("seo_generate").onclick = async () => {
    const subject = document.getElementById("seo_input").value;
    if (!subject) return alert("Enter subject first");

    document.getElementById("seo_reply").innerText = "⏳ Thinking...";

    try {
        const res = await fetch(`${API_BASE}/assistant/seo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject })
        });
        const data = await res.json();
        document.getElementById("seo_reply").innerText = data.reply || "⚠️ No reply";
    } catch (err) {
        document.getElementById("seo_reply").innerText = "❌ Error contacting assistant.";
    }
};


// ---------------- Thumbnail Generator ---------------- //
document.getElementById("thumbnail_generate").onclick = async () => {
    const subject = document.getElementById("thumbnail_input").value;
    if (!subject) return alert("Enter subject first");

    document.getElementById("thumbnail_reply").innerText = "⏳ Thinking...";

    try {
        const res = await fetch(`${API_BASE}/assistant/thumbnail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject })
        });
        const data = await res.json();
        document.getElementById("thumbnail_reply").innerText = data.reply || "⚠️ No reply";
    } catch (err) {
        document.getElementById("thumbnail_reply").innerText = "❌ Error contacting assistant.";
    }
};
