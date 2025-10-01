// script.js - Visora frontend
// ⚠️ Change BASE_URL if your backend is different
const BASE_URL = "https://visora.onrender.com";
document.getElementById('baseUrlShow').innerText = BASE_URL;

// page switching
document.querySelectorAll('.nav-btn').forEach(b=>{
  b.addEventListener('click', ()=> {
    document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    show(b.dataset.page);
  });
});
document.querySelectorAll('[data-page-open]').forEach(e=>{
  e.addEventListener('click', ()=> show(e.dataset.pageOpen || e.getAttribute('data-page-open')));
});
function show(id){
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
  document.getElementById('pageTitle').innerText = id.charAt(0).toUpperCase() + id.slice(1);
}

// Refresh master data
document.getElementById('refreshBtn').addEventListener('click', refreshAll);
async function refreshAll(){
  await Promise.all([ loadDashboard(), listTemplates(), loadGallery(), listCharacters(), loadProfile() ]);
}

// Helper escape
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// DASHBOARD
async function loadDashboard(){
  try {
    const p = await (await fetch(`${BASE_URL}/profile/demo@visora.com`)).json();
    document.getElementById('credits').innerText = p.credits ?? '0';
  } catch(e){ document.getElementById('credits').innerText = 'N/A'; }
  await listTemplates();
  try {
    const g = await (await fetch(`${BASE_URL}/gallery?user_email=demo@visora.com`)).json();
    const html = (Array.isArray(g)? g.slice(0,6).map(v=>`<div class="job"><strong>${escapeHtml(v.title)}</strong> · ${escapeHtml(v.status)} · <small>${new Date(v.created_at).toLocaleString()}</small></div>`).join('') : '<div class="muted">No jobs</div>');
    document.getElementById('recentJobs').innerHTML = html;
  } catch(e){ document.getElementById('recentJobs').innerText = 'Jobs load failed'; }
}

// TEMPLATES
async function listTemplates(){
  try {
    const res = await fetch(`${BASE_URL}/templates/trending`);
    const arr = await res.json();
    const el = document.getElementById('trendingList');
    el.innerHTML = (Array.isArray(arr) && arr.length) ? arr.map(t=>`<div>${escapeHtml(t.name)} <span class="muted">(${escapeHtml(t.category)})</span></div>`).join('') : '<div class="muted">No templates</div>';
  } catch(e){
    document.getElementById('trendingList').innerText = 'Templates failed';
  }
}

// GALLERY
async function loadGallery(){
  const el = document.getElementById('galleryList');
  el.innerHTML = 'Loading...';
  try {
    const arr = await (await fetch(`${BASE_URL}/gallery?user_email=demo@visora.com`)).json();
    if(!Array.isArray(arr) || arr.length===0){ el.innerHTML = '<div class="muted">No videos yet</div>'; return; }
    el.innerHTML = arr.map(v => `
      <div class="row between job">
        <div><strong>${escapeHtml(v.title)}</strong><br/><small class="muted">${new Date(v.created_at).toLocaleString()}</small></div>
        <div class="row gap">
          ${v.file ? `<a class="link" href="${BASE_URL}/outputs/${encodeURIComponent(v.file.split('/').pop())}" target="_blank">Open</a>` : ''}
          <button class="btn" onclick="selectForEdit(${v.id})">Edit</button>
        </div>
      </div>
    `).join('');
  } catch(e){ el.innerText = 'Gallery load error'; }
}

// CHARACTERS
async function listCharacters(){
  const out = document.getElementById('ch_list');
  out.innerHTML = 'Loading...';
  try {
    const arr = await (await fetch(`${BASE_URL}/characters?user_email=demo@visora.com`)).json();
    if(!Array.isArray(arr) || arr.length===0){ out.innerHTML = '<div class="muted">No characters</div>'; return; }
    out.innerHTML = arr.map(c=>`<div class="row between"><div><img class="thumb" src="${BASE_URL}/uploads/${c.photo ? c.photo.split('/').pop() : ''}" onerror="this.style.display='none'"/><strong>${escapeHtml(c.name)}</strong></div><div class="muted">${c.voice ? 'Has voice' : ''}</div></div>`).join('');
  } catch(e){ out.innerHTML = 'Characters load failed'; }
}

// PROFILE
async function loadProfile(){
  const pbox = document.getElementById('profileBox');
  try {
    const p = await (await fetch(`${BASE_URL}/profile/demo@visora.com`)).json();
    pbox.innerText = JSON.stringify(p, null, 2);
  } catch(e){ pbox.innerText = 'Profile load failed'; }
}
document.getElementById('profile_refresh').addEventListener('click', loadProfile);

// CREATE VIDEO - Quick
document.getElementById('btn_generate').addEventListener('click', async ()=>{
  const btn = document.getElementById('btn_generate'); btn.disabled = true; btn.innerText = 'Generating...';
  const fd = new FormData();
  fd.append('user_email','demo@visora.com');
  fd.append('title', document.getElementById('cv_title').value || `Video ${new Date().toISOString()}`);
  fd.append('script', document.getElementById('cv_script').value || '');
  fd.append('template', document.getElementById('cv_template').value);
  fd.append('quality', document.getElementById('cv_quality').value);
  fd.append('lang', document.getElementById('cv_lang').value);
  fd.append('length_type', document.getElementById('cv_length').value);
  for (let f of document.getElementById('cv_images').files) fd.append('characters', f, f.name);
  for (let f of document.getElementById('cv_voices').files) fd.append('character_voice_files', f, f.name);
  const bg = document.getElementById('cv_bg').files[0]; if(bg) fd.append('bg_music_file', bg, bg.name);
  try {
    const resp = await fetch(`${BASE_URL}/generate_video`, { method:'POST', body: fd });
    const j = await resp.json();
    document.getElementById('create_resp').innerHTML = `<pre>${escapeHtml(JSON.stringify(j,null,2))}</pre>`;
    await loadGallery(); await loadDashboard();
  } catch(e){
    document.getElementById('create_resp').innerText = 'Generate failed: ' + e;
  } finally { btn.disabled=false; btn.innerText='Generate'; }
});
document.getElementById('btn_auto').addEventListener('click', ()=>{
  document.getElementById('cv_title').value='Promo: Visora AI';
  document.getElementById('cv_script').value='C1: Hello! Welcome to Visora. C2: We make cinematic AI videos in seconds.';
  document.getElementById('cv_template').value='Promo';
});

// IMAGE -> VIDEO
document.getElementById('iv_submit').addEventListener('click', async ()=>{
  const img = document.getElementById('iv_image').files[0];
  if(!img){ alert('Upload image'); return; }
  const fd = new FormData();
  fd.append('user_email','demo@visora.com');
  fd.append('title','Image to Video ' + new Date().toISOString());
  fd.append('template','Cinematic');
  fd.append('quality','HD');
  fd.append('characters', img, img.name);
  const v = document.getElementById('iv_voice').files[0]; if(v) fd.append('character_voice_files', v, v.name);
  document.getElementById('iv_resp').innerText='Submitting...';
  try {
    const r = await fetch(`${BASE_URL}/generate_video`, { method:'POST', body: fd });
    const j = await r.json();
    document.getElementById('iv_resp').innerHTML = `<pre>${escapeHtml(JSON.stringify(j,null,2))}</pre>`;
    await loadGallery();
  } catch(e){ document.getElementById('iv_resp').innerText='Error: '+e; }
});

// SCRIPT -> VIDEO
document.getElementById('sv_submit').addEventListener('click', async ()=>{
  const script = document.getElementById('sv_script').value;
  if(!script){ alert('Script required'); return; }
  const fd = new FormData();
  fd.append('user_email','demo@visora.com');
  fd.append('title','ScriptVideo '+new Date().toISOString());
  fd.append('script', script);
  fd.append('template','Explainer');
  fd.append('quality','HD');
  document.getElementById('sv_resp').innerText='Submitting...';
  try {
    const r = await fetch(`${BASE_URL}/generate_video`, { method:'POST', body: fd });
    const j = await r.json();
    document.getElementById('sv_resp').innerHTML = `<pre>${escapeHtml(JSON.stringify(j,null,2))}</pre>`;
    await loadGallery();
  } catch(e){ document.getElementById('sv_resp').innerText='Error: '+e; }
});

// ASSISTANT
document.getElementById('assistant_quick_btn').addEventListener('click', assistantQuick);
document.getElementById('as_call').addEventListener('click', callAssistant);
async function assistantQuick(){
  const q = document.getElementById('assistant_quick_q').value || 'Give me an opening line for a promo';
  const tone = document.getElementById('assistant_tone').value || 'helpful';
  try {
    const resp = await fetch(`${BASE_URL}/assistant`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ query:q, tone, lang:'hi' })});
    const j = await resp.json();
    document.getElementById('assistant_quick_reply').innerText = j.reply || 'No reply';
  } catch(e){ document.getElementById('assistant_quick_reply').innerText='Assistant error'; }
}
async function callAssistant(){
  const q = document.getElementById('as_q').value || 'Help me write a short ad';
  const tone = document.getElementById('as_tone').value || 'helpful';
  try {
    const resp = await fetch(`${BASE_URL}/assistant`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ query:q, tone, lang:'hi' })});
    const j = await resp.json();
    document.getElementById('as_reply').innerText = j.reply || 'No reply';
  } catch(e){ document.getElementById('as_reply').innerText='Assistant error'; }
}

// CHARACTERS - save
document.getElementById('ch_save').addEventListener('click', async ()=>{
  const fd = new FormData();
  fd.append('user_email','demo@visora.com');
  fd.append('name', document.getElementById('ch_name').value || 'MyChar');
  if(document.getElementById('ch_photo').files[0]) fd.append('photo', document.getElementById('ch_photo').files[0]);
  if(document.getElementById('ch_voice').files[0]) fd.append('voice', document.getElementById('ch_voice').files[0]);
  document.getElementById('ch_resp').innerText='Saving...';
  try {
    const r = await fetch(`${BASE_URL}/character`, { method:'POST', body: fd });
    const j = await r.json();
    document.getElementById('ch_resp').innerHTML = `<pre>${escapeHtml(JSON.stringify(j,null,2))}</pre>`;
    await listCharacters();
  } catch(e){ document.getElementById('ch_resp').innerText='Save failed'; }
});
document.getElementById('ch_list_btn').addEventListener('click', listCharacters);

// PAYMENTS - stub
document.getElementById('rz_create').addEventListener('click', async ()=>{
  const amt = document.getElementById('rz_amount').value;
  document.getElementById('rz_resp').innerText = 'Creating...';
  try {
    const r = await fetch(`${BASE_URL}/create_razorpay_order`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ amount: amt })});
    const j = await r.json();
    document.getElementById('rz_resp').innerText = JSON.stringify(j);
  } catch(e){ document.getElementById('rz_resp').innerText = 'Create failed'; }
});

// small helpers for edit selection (stub)
function selectForEdit(id){
  alert('Select for edit: ' + id + ' (open Edit page in next release)');
}

// POLL gallery periodically (jobs)
setInterval(loadGallery, 15000);

// initial load
refreshAll();
