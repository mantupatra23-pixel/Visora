// app.js - minimal frontend to call backend
const BACKEND_URL = "https://visora.onrender.com"; // <-- change if needed

const el = id => document.getElementById(id);
const statusEl = el("status");
const resWrap = el("result");
const resContent = el("resultContent");

function setStatus(text, isError=false){
  statusEl.textContent = `Status: ${text}`;
  statusEl.style.color = isError ? "#ff8b8b" : "#bfe3a8";
}

async function postJson(path, body){
  const url = BACKEND_URL + path;
  try{
    setStatus("contacting backend...");
    const res = await fetch(url, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
    const j = await res.json();
    if(!res.ok) throw new Error(j.error || JSON.stringify(j));
    return j;
  }catch(e){
    setStatus("Network error: " + e.message, true);
    throw e;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  el("genScript").addEventListener("click", async () => {
    const prompt = el("script").value.trim() || "Create a short YouTube script about tech tips";
    setStatus("Generating AI script...");
    try{
      // backend route /assistant expects { query, tone, lang }
      const r = await postJson("/assistant", { query: prompt, tone: "helpful", lang: "hi" });
      if(r.reply) {
        el("script").value = r.reply;
        setStatus("AI script generated ✅");
      } else {
        setStatus("AI returned no reply", true);
      }
    }catch(e){
      console.error(e);
    }
  });

  el("createVideo").addEventListener("click", async () => {
    const scriptText = el("script").value.trim();
    if(!scriptText){ setStatus("Write or generate script first", true); return; }

    setStatus("Requesting video generation...");
    try{
      // This example uses the /generate_video endpoint which in our backend expects a form-data.
      // For simplicity here we call a JSON-only stub: /generate_video (adapt your backend if needed).
      // If your backend expects multipart/form-data, change this logic to use FormData.
      const payload = {
        user_email: "demo@visora.com",
        title: "Auto Video - " + new Date().toISOString(),
        script: scriptText,
        template: el("template").value,
        quality: "HD",
        length_type: "short",
        lang: "hi",
        bg_music: el("bg").value
      };
      const r = await postJson("/generate_video", payload);
      // backend should return job id or result; adapt according to your backend response
      if(r.job_id || r.status === "queued" || r.status === "ok"){
        resWrap.style.display = "block";
        resContent.innerText = JSON.stringify(r, null, 2);
        setStatus("Video job queued ✅");
      } else {
        resWrap.style.display = "block";
        resContent.innerText = JSON.stringify(r, null, 2);
        setStatus("Video request sent (check logs).", false);
      }
    }catch(e){
      console.error(e);
    }
  });
});
