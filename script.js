// script.js - Visora frontend glue
const BASE_URL = "https://visora.onrender.com"; // <-- change here to your live backend
document.getElementById('baseUrlShow').innerText = BASE_URL;

// navigation
document.querySelectorAll('.nav-btn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    show(b.dataset.page);
  });
});
document.querySelectorAll('[data-page-open]').forEach(x=>{
  x.addEventListener('click', ()=> show(x.dataset.pageOpen || x.getAttribute('data-page-open')));
});
document.getElementById('refreshBtn').addEventListener('click', refreshAll);

// show page
function show(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  const el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
  document.getElementById('pageTitle').innerText = id.charAt(0).toUpperCase() + id.slice(1);
}

// on load
async function refreshAll(){
  await Promise.all([ loadDashboard(), listTemplates(), loadGallery(), listCharacters(), loadProfile() ]);
}
window.addEventListener('load', async ()=> {
  populateTemplateSelect();
  await refreshAll();
  setInterval(loadJobs, 10000);
});

// ---------- helpers ----------
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }
async function apiGet(path){ const r = await fetch(BASE_URL+path); return r.json(); }
async function apiPost(path, body){ const r = await fetch(BASE_URL+path, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); return r.json(); }
async function apiPostForm(path, form){ const r = await fetch(BASE_URL+path, {method:'POST', body: form}); return r.json(); }

// ---------- Dashboard ----------
async function loadDashboard(){
  try {
    const profile = await apiGet('/profile/demo@visora.com');
    document.getElementById('credits').innerText = profile.credits ?? '0';
    document.getElementById('planName').innerText = profile.plan ?? 'Free';
  } catch(e){ console.warn(e); document.getElementById('credits').innerText = 'N/A'; }
  await listTemplates();
  await loadGallery();
}
async function listTemplates(){
  try {
    const arr = await apiGet('/templates/trending');
    document.getElementById('trendingList').innerHTML = arr.map(t=>`<div>${escapeHtml(t.name)} <small class="muted">(${escapeHtml(t.category)})</small></div>`).join('') || '<div class="muted">No templates</div>';
    // fill select
    const sel = document.getElementById('cv_template');
    sel.innerHTML = arr.map(t=>`<option>${escapeHtml(t.name)}</option>`).join('') || `<option>Motivation</option><option>Promo</option>`;
  } catch(e){ console.warn(e); }
}

// ---------- Create Video ----------
document.getElementById('btn_auto').addEventListener('click', ()=> {
  document.getElementById('cv_title').value = 'Promo: Visora AI';
  document.getElementById('cv_script').value = 'C1: Hello! Welcome to Visora. C2: We make cinematic AI videos in seconds.';
  document.getElementById('cv_template').value = 'Promo';
});
document.getElementById('btn_generate').addEventListener('click', createVideo);
async function createVideo(){
  const btn = document.getElementById('btn_generate');
  btn.disabled = true; btn.innerText = 'Generating...';
  const fd = new FormData();
  fd.append('user_email','demo@visora.com');
  fd.append('title', document.getElementById('cv_title').value || `Video ${new Date().toISOString()}`);
  fd.append('script', document.getElementById('cv_script').value || '');
  fd.append('template', document.getElementById('cv_template').value);
  fd.append('quality', document.getElementById('cv_quality').value);
  fd.append('lang', document.getElementById('cv_lang').value);
  fd.append('length_type', document.getElementById('cv_length').value);

  // attach images
  const imgFiles = document.getElementById('cv_images').files;
  for (let f of imgFiles) fd.append('characters', f, f.name);
  // attach voices
  const vFiles = document.getElementById('cv_voices').files;
  for (let f of vFiles) fd.append('character_voice_files', f, f.name);
  // bg
  const bg = document.getElementById('cv_bg').files[0];
  if (bg) fd.append('bg_music_file', bg, bg.name);

  try {
    const resp = await fetch(`${BASE_URL}/generate_video`, { method:'POST', body: fd });
    const j = await resp.json();
    document.getElementById('create_resp').innerHTML = `<pre>${escapeHtml(JSON.stringify(j, null, 2))}</pre>`;
  } catch (e) {
    document.getElementById('create_resp').innerText = 'Generate failed: ' + e;
  } finally {
    btn.disabled = false; btn.innerText = 'Generate';
    await loadGallery(); await loadDashboard();
  }
}

// ---------- Image -> Video ----------
document.getElementById('iv_submit').addEventListener('click', async ()=>{
  const img = document.getElementById('iv_image').files[0];
  if(!img) return alert('Upload image');
  const fd = new FormData(); fd.append('user_email','demo@visora.com'); fd.append('title','ImageToVideo '+Date.now()); fd.append('template','Cinematic'); fd.append('quality','HD');
  fd.append('characters', img, img.name);
  const voice = document.getElementById('iv_voice').files[0]; if(voice) fd.append('character_voice_files', voice, voice.name);
  document.getElementById('iv_resp').innerText = 'Submitting...';
  try { const r = await fetch(`${BASE_URL}/generate_video`, {method:'POST', body:fd}); const j=await r.json(); document.getElementById('iv_resp').innerHTML=`<pre>${escapeHtml(JSON.stringify(j,null,2))}</pre>`; await loadGallery(); } catch(e){ document.getElementById('iv_resp').innerText='Error: '+e; }
});

// ---------- Script -> Video ----------
document.getElementById('sv_submit').addEventListener('click', async ()=>{
  const script = document.getElementById('sv_script').value;
  if(!script) return alert('Script required');
  const fd = new FormData(); fd.append('user_email','demo@visora.com'); fd.append('title','ScriptVideo '+Date.now()); fd.append('script', script); fd.append('template','Explainer'); fd.append('quality','HD');
  document.getElementById('sv_resp').innerText='Submitting...';
  try { const r=await fetch(`${BASE_URL}/generate_video`,{method:'POST',body:fd}); const j=await r.json(); document.getElementById('sv_resp').innerHTML=`<pre>${escapeHtml(JSON.stringify(j,null,2))}</pre>`; await loadGallery(); } catch(e){ document.getElementById('sv_resp').innerText='Error: '+e; }
});
document.getElementById('sv_suggest').addEventListener('click', async ()=>{
  const script = document.getElementById('sv_script').value || '';
  const res = await apiPost('/assistant',{query: script || 'Give me a short promo hook', lang:'hi', tone:'friendly'}); document.getElementById('sv_resp').innerText = res.reply || JSON.stringify(res);
});

// ---------- Characters ----------
document.getElementById('ch_save').addEventListener('click', async ()=>{
  const fd = new FormData(); fd.append('user_email','demo@visora.com'); fd.append('name',document.getElementById('ch_name').value || 'Char');
  const ph = document.getElementById('ch_photo').files[0]; if(ph) fd.append('photo', ph, ph.name);
  const vo = document.getElementById('ch_voice').files[0]; if(vo) fd.append('voice', vo, vo.name);
  document.getElementById('ch_resp').innerText = 'Saving...';
  try { const r = await fetch(`${BASE_URL}/character`,{method:'POST',body:fd}); const j=await r.json(); document.getElementById('ch_resp').innerHTML = `<pre>${escapeHtml(JSON.stringify(j,null,2))}</pre>`; await listCharacters(); } catch(e){ document.getElementById('ch_resp').innerText = 'Error: '+e; }
});
document.getElementById('ch_list_btn').addEventListener('click', listCharacters);
async function listCharacters(){
  try {
    const arr = await apiGet('/characters?user_email=demo@visora.com');
    const el = document.getElementById('ch_list'); el.innerHTML = arr.map(c => `<div style="padding:8px;border-bottom:1px solid #111"><strong>${escapeHtml(c.name)}</strong><br/><small class="muted">${escapeHtml(c.ai_style||'')}</small></div>`).join('') || '<div class="muted">No characters</div>';
  } catch(e){ console.warn(e); }
}

// ---------- Gallery / Jobs ----------
async function loadGallery(){
  try {
    const g = await apiGet('/gallery?user_email=demo@visora.com');
    const el = document.getElementById('galleryList');
    if(!Array.isArray(g) || g.length===0){ el.innerHTML = '<div class="muted">No videos yet</div>'; return;}
    el.innerHTML = g.map(v => `<div class="py-2 border-b"><strong>${escapeHtml(v.title)}</strong> · ${escapeHtml(v.status)} · <small class="muted">${new Date(v.created_at).toLocaleString()}</small><div>${v.file ? `<a href="${BASE_URL}/outputs/${encodeURIComponent(v.file.split('/').pop())}" target="_blank">Open</a>`:''}</div></div>`).join('');
  } catch(e){ console.warn(e); }
}
async function loadJobs(){
  try {
    const res = await fetch(`${BASE_URL}/gallery?user_email=demo@visora.com`);
    const arr = await res.json();
    const html = arr.slice(0,8).map(v=>`<div>${escapeHtml(v.title)} - ${escapeHtml(v.status)}</div>`).join('') || '<div class="muted">No jobs</div>';
    document.getElementById('recentJobs').innerHTML = html;
  } catch(e){ console.warn(e); }
}

// ---------- Assistant ----------
document.getElementById('assistant_quick_btn').addEventListener('click', async ()=>{
  const q = document.getElementById('assistant_quick_q').value || 'Give a hook';
  const tone = document.getElementById('assistant_tone').value;
  const res = await apiPost('/assistant', {query: q, tone, lang:'hi'});
  document.getElementById('assistant_quick_reply').innerText = res.reply || JSON.stringify(res);
});
document.getElementById('as_call').addEventListener('click', async ()=>{
  const q = document.getElementById('as_q').value || 'Help me write a promo';
  const tone = document.getElementById('as_tone').value;
  const res = await apiPost('/assistant', {query:q, tone, lang:'hi'});
  document.getElementById('as_reply').innerText = res.reply || JSON.stringify(res);
});

// ---------- Profile ----------
document.getElementById('profile_refresh').addEventListener('click', loadProfile);
async function loadProfile(){
  try {
    const p = await apiGet('/profile/demo@visora.com'); document.getElementById('profileBox').innerText = JSON.stringify(p, null, 2);
  } catch(e){ document.getElementById('profileBox').innerText = 'Error'; }
}
