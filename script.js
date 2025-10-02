// ================== CONFIG ==================
const API_BASE = (window.__VISORA_API_BASE__ || "https://visora.onrenderer.com").replace(/\/$/,''); // change if needed
document.addEventListener("DOMContentLoaded", init);

function init(){
  document.getElementById("baseUrlShow").textContent = API_BASE;
  setupNav();
  setupButtons();
  loadDashboard();
  setInterval(loadJobs, 10000);
}

// ================== NAVIGATION ==================
function setupNav(){
  document.querySelectorAll('.nav-btn').forEach(b=>{
    b.addEventListener('click', ()=> {
      document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      openPage(b.dataset.page);
    });
  });
  // quick open buttons
  document.querySelectorAll('[data-page-open]').forEach(btn=>{
    btn.addEventListener('click', ()=> openPage(btn.dataset.pageOpen || btn.getAttribute('data-page-open')));
  });
}

function openPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  const el = document.getElementById(page);
  if(el) el.classList.remove('hidden');
  document.getElementById('pageTitle').textContent = page;
}

// ================== UI Event Bindings ==================
function setupButtons(){
  document.getElementById('refreshBtn').addEventListener('click', loadDashboard);
  document.getElementById('btn_auto').addEventListener('click', ()=> {
    document.getElementById('cv_title').value = "Motivational Short";
    document.getElementById('cv_script').value = "Hook: Zindagi ka ek raaz...\n[C1]: Hello main tumhara host hoon...";
  });

  document.getElementById('btn_generate').addEventListener('click', onCreateVideoQuick);
  document.getElementById('assistant_quick_btn').addEventListener('click', onAssistantQuick);
  document.getElementById('iv_submit').addEventListener('click', onImageToVideo);
  document.getElementById('sv_submit').addEventListener('click', onScriptToVideo);
  document.getElementById('as_call').addEventListener('click', onAssistantFull);
  document.getElementById('profile_refresh').addEventListener('click', loadProfile);
  document.getElementById('rz_create').addEventListener('click', onCreateRazorpayOrder);
}

// ================== DASHBOARD / DATA LOADERS ==================
async function loadDashboard(){
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    const data = await res.json();
    document.getElementById('plan').textContent = data.plan || "Free";
    document.getElementById('credits').textContent = (data.credits!=null?data.credits:"0");
    renderTrending(data.trending || []);
    renderRecentJobs(data.recent_jobs || []);
  } catch(err){
    console.error(err);
    // fallback: try jobs only
    loadJobs();
  }
}

function renderTrending(list){
  const box = document.getElementById('trendingList');
  box.innerHTML = '';
  list.slice(0,8).forEach(t => {
    const d = document.createElement('div');
    d.className = 'tpl';
    d.innerHTML = `<div class="t">${t.name}</div>`;
    d.addEventListener('click', ()=> {
      document.getElementById('cv_template').value = t.key || t.name;
      openPage('create');
    });
    box.appendChild(d);
  });
}

function renderRecentJobs(list){
  const el = document.getElementById('recentJobs');
  el.innerHTML = '';
  if(!list.length) { el.textContent = 'No recent jobs'; return; }
  list.forEach(j=>{
    const li = document.createElement('li');
    li.textContent = `${j.id} — ${j.status} (${j.out_name||''})`;
    el.appendChild(li);
  });
}

// ================== JOBS ==================
async function loadJobs(){
  try {
    const res = await fetch(`${API_BASE}/jobs`);
    const data = await res.json();
    const ul = document.getElementById('jobs-list');
    ul.innerHTML = '';
    (data.jobs||[]).forEach(j=>{
      const li = document.createElement('li');
      li.textContent = `${j.id} — ${j.status}`;
      ul.appendChild(li);
    });
  } catch(err){
    console.error(err);
  }
}

// ================== CREATE QUICK VIDEO ==================
async function onCreateVideoQuick(){
  const title = document.getElementById('cv_title').value.trim();
  const script = document.getElementById('cv_script').value;
  const template = document.getElementById('cv_template').value;
  const quality = document.getElementById('cv_quality').value;
  const lang = document.getElementById('cv_lang').value;
  const images = document.getElementById('cv_images').files;
  const voices = document.getElementById('cv_voices').files;
  const bg = document.getElementById('cv_bg').files[0];

  const form = new FormData();
  form.append('title', title);
  form.append('script', script);
  form.append('template', template);
  form.append('quality', quality);
  form.append('lang', lang);

  for(let i=0;i<images.length;i++) form.append('images', images[i]);
  for(let i=0;i<voices.length;i++) form.append('voices', voices[i]);
  if(bg) form.append('bg', bg);

  try {
    const r = await fetch(`${API_BASE}/create-video-quick`, { method:'POST', body: form });
    const j = await r.json();
    document.getElementById('create_resp').textContent = 'Job queued: ' + (j.job_id || 'unknown');
    loadJobs();
  } catch(e){
    console.error(e);
    alert('Create failed');
  }
}

// ================== IMAGE → VIDEO ==================
async function onImageToVideo(){
  const image = document.getElementById('iv_image').files[0];
  const voice = document.getElementById('iv_voice').files[0];
  if(!image){ alert('Please select an image'); return; }
  const f = new FormData();
  f.append('image', image);
  if(voice) f.append('voice', voice);

  try {
    const res = await fetch(`${API_BASE}/create-video-image`, { method:'POST', body: f });
    const data = await res.json();
    document.getElementById('iv_resp').textContent = 'Job queued: ' + (data.job_id||'?');
    loadJobs();
  } catch(err){ console.error(err); alert('Failed'); }
}

// ================== SCRIPT → VIDEO ==================
async function onScriptToVideo(){
  const script = document.getElementById('sv_script').value;
  if(!script.trim()){ alert('Please paste script'); return; }
  try {
    const res = await apiCall('/create-video-script', { script });
    document.getElementById('sv_resp').textContent = 'Job queued: ' + (res.job_id||'?');
    loadJobs();
  } catch(err){ console.error(err); }
}

// ================== ASSISTANT (ChatGPT) quick & full ==================
async function onAssistantQuick(){
  const q = document.getElementById('assistant_quick_q').value;
  const tone = document.getElementById('assistant_tone').value;
  if(!q.trim()){ alert('Type a short prompt'); return; }
  try {
    const res = await apiCall('/assistant/quick', { prompt:q, tone });
    document.getElementById('assistant_quick_reply').textContent = res.reply || '—';
  } catch(err){ console.error(err); alert('Assistant failed'); }
}

async function onAssistantFull(){
  const q = document.getElementById('as_q').value;
  const tone = document.getElementById('as_tone').value;
  if(!q.trim()) return;
  try {
    const res = await apiCall('/assistant', { prompt:q, tone });
    document.getElementById('as_reply').textContent = JSON.stringify(res, null, 2);
  } catch(e){ console.error(e); alert('Assistant error'); }
}

// ================== PROFILE / PAYMENT ==================
async function loadProfile(){
  try {
    const res = await fetch(`${API_BASE}/profile`);
    const data = await res.json();
    document.getElementById('profileBox').textContent = JSON.stringify(data, null, 2);
  } catch(e){ console.error(e); }
}

async function onCreateRazorpayOrder(){
  const amt = document.getElementById('rz_amount').value;
  if(!amt) return alert('Enter amount');
  try {
    const res = await apiCall('/payments/razorpay/create', { amount: amt });
    document.getElementById('rz_resp').textContent = 'Order created: ' + (res.order_id||'?');
  } catch(e){ console.error(e); alert('Payment error'); }
}

// ================== HELPERS: API CALLS ==================
async function apiCall(endpoint, body){
  try {
    const res = await fetch(API_BASE + endpoint, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch(err){ console.error(err); throw err; }
}

async function apiCallForm(endpoint, formData){
  try {
    const res = await fetch(API_BASE + endpoint, { method:'POST', body: formData });
    return await res.json();
  } catch(err){ console.error(err); throw err; }
}
