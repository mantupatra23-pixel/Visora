const BASE_URL = "https://visora.onrender.com";
document.getElementById("baseUrlShow").innerText = BASE_URL;

function switchPage(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  document.getElementById(page).classList.remove("hidden");
  document.querySelectorAll(".nav button").forEach(b=>b.classList.remove("active"));
  document.querySelector(`.nav button[data-page=${page}]`).classList.add("active");
  document.getElementById("pageTitle").innerText=page;
}
document.querySelectorAll(".nav button").forEach(btn=>btn.addEventListener("click",()=>switchPage(btn.dataset.page)));

async function getJSON(url){return (await fetch(url)).json();}
async function postJSON(url,body){return (await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})).json();}
async function postForm(url,fd){return (await fetch(url,{method:"POST",body:fd})).json();}

// Dashboard
async function loadDashboard(){
  let p=await getJSON(`${BASE_URL}/profile/demo@visora.com`).catch(()=>({}));
  document.getElementById("credits").innerText=p.credits||"0";
  document.getElementById("planName").innerText=p.plan||"Free";
  document.getElementById("notifyBox").innerText="Welcome back!";
  let t=await getJSON(`${BASE_URL}/templates/trending`).catch(()=>[]);
  document.getElementById("trendingList").innerHTML=t.map(x=>x.name).join("<br/>");
  let g=await getJSON(`${BASE_URL}/gallery?user_email=demo@visora.com`).catch(()=>[]);
  document.getElementById("recentJobs").innerHTML=g.map(v=>`${v.title} - ${v.status}`).join("<br/>");
}
document.getElementById("refreshBtn").addEventListener("click",loadDashboard);
loadDashboard();

// Create Video
document.getElementById("btn_generate").addEventListener("click",async()=>{
  let fd=new FormData();
  fd.append("user_email","demo@visora.com");
  fd.append("title",document.getElementById("cv_title").value);
  fd.append("script",document.getElementById("cv_script").value);
  fd.append("template",document.getElementById("cv_template").value);
  fd.append("voice",document.getElementById("cv_voice").value);
  let res=await postForm(`${BASE_URL}/generate_video`,fd);
  document.getElementById("create_resp").innerText=JSON.stringify(res,null,2);
});

// Templates load
async function loadTemplates(){
  let arr=await getJSON(`${BASE_URL}/templates/all`).catch(()=>[]);
  document.getElementById("tpl_list").innerHTML=arr.map(t=>`<div>${t.name}</div>`).join("");
}
loadTemplates();

// Voices load
async function loadVoices(){
  let arr=await getJSON(`${BASE_URL}/voices/all`).catch(()=>[]);
  document.getElementById("voice_list").innerHTML=arr.map(v=>`<div>${v.name} (${v.lang})</div>`).join("");
}
loadVoices();

// Assistant (ChatGPT)
document.getElementById("as_call").addEventListener("click",async()=>{
  let q=document.getElementById("as_q").value;
  let r=await postJSON(`${BASE_URL}/assistant`,{query:q});
  document.getElementById("as_reply").innerText=r.reply||JSON.stringify(r);
});

// Profile
async function loadProfile(){
  let p=await getJSON(`${BASE_URL}/profile/demo@visora.com`);
  document.getElementById("profileBox").innerText=JSON.stringify(p,null,2);
}
loadProfile();
