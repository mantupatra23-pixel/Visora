// script.js - Visora frontend logic
const BASE_URL = "https://visora.onrender.com"; // <<< अगर अलग हो तो यहाँ बदलना
document.getElementById('baseUrlShow').innerText = BASE_URL;

// simple page router
document.querySelectorAll('.nav-btn').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    showPage(b.dataset.page);
  });
});
document.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click', ()=>{
  showPage(el.dataset.open);
}));

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  const el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
  document.getElementById('pageTitle').innerText = id.charAt(0).toUpperCase() + id.slice(1);
}

// refresh actions
document.getElementById('refreshBtn').addEventListener('click', ()=>refreshAll());
async function refreshAll(){
  await Promise.all([loadDashboard(), listTemplates(), loadGallery(), listCharacters(), loadProfile()]);
}

// -- Dashboard --
async function loadDashboard(){
  // profile credits
  try{
    const res = await fetch(`${BASE_URL}/profile/demo@visora.com`);
    if(res.ok){
      const j = await res.json();
      document.getElementById('credits').innerText = j.credits ?? '0';
    } else {
      document.getElementById('credits').innerText = 'N/A';
    }
  }catch(e){ document.getElementById('credits').innerText='N/A'; }
  // templates trending
  try{
    const t = await (await fetch(`${BASE_URL}/templates/trending`)).json();
    document.getElementById('trendingList').innerHTML = t.map(x=>`${escapeHtml(x.name)} (${escapeHtml(x.category)})`).slice(0,6).join('<br/>') || '—';
  }catch(e){ document.getElementById('trendingList').innerText='Templates load failed'; }

  // recent jobs
  try{
    const g = await (await fetch(`${BASE_URL}/gallery?user_email=demo@visora.com`)).json();
    const html = g.slice(0,6).map(v=>`<div class="job"><strong>${escapeHtml(v.title)}</strong> · ${escapeHtml(v.status)} · <small class="muted">${new Date(v.created_at).toLocaleString()}</small></div>`).join('');
    document.getElementById('recentJobs').innerHTML = html || '<div class="muted">No jobs yet</div>';
  }catch(e){ document.getElementById('recentJobs').innerText='Error loading jobs'; }
}

// -- Templates list (helper for dashboard) --
async function listTemplates(){
  try{
    const res = await fetch(`${BASE_URL}/templates/trending`);
    if(!res.ok) throw 'err';
    const arr = await res.json();
    document.getElementById('trendingList').innerHTML = arr.map(t=>`${escapeHtml(t.name)} <span class="muted">(${escapeHtml(t.category)})</span>`).slice(0,6).join('<br>') || '—';
  }catch(e){ /* silent */ }
}

// -- Create Video (form) --
document.getElementById('btn_auto').addEventListener('click', autoFillSample);
document.getElementById('btn_generate').addEventListener('click', submitCreate);

function autoFillSample(){
  document.getElementById('cv_title').value = 'Promo: Visora AI';
  document.getElementById('cv_script').value = 'C1: Hello! Welcome to Visora. C2: We make cinematic AI videos in seconds.';
  document.getElementById('cv_template').value = 'Promo';
}

async function submitCreate(){
  const btn = document.getElementById('btn_generate');
  btn.disabled = true; btn.innerText = 'Generating...';
  try{
    const fd = new FormData();
    fd.append('user_email','demo@visora.com');
    fd.append('title', document.getElementById('cv_title').value || `Video ${new Date().toISOString()}`);
    fd.append('script', document.getElementById('cv_script').value || '');
    fd.append('template', document.getElementById('cv_template').value);
    fd.append('quality', document.getElementById('cv_quality').value);
    fd.append('lang', document.getElementById('cv_lang').value);
    fd.append('length_type', document.getElementById('cv_length').value);

    // images
    const imgs = document.getElementById('cv_images').files;
    for (let f of imgs) fd.append('characters', f, f.name);
    // voices
    const vs = document.getElementById('cv_voices').files;
    for (let f of vs) fd.append('character_voice_files', f, f.name);
    // bg
    const bg = document.getElementById('cv_bg').files[0];
    if(bg) fd.append('bg_music_file', bg, bg.name);

    const res = await fetch(`${BASE_URL}/generate_video`, { method:'POST', body: fd });
    const json = await res.json();
    document.getElementById('create_resp').innerHTML = `<pre>${escapeHtml(JSON.stringify(json, null, 2))}</pre>`;
    await loadGallery(); await loadDashboard();
  }catch(e){
    document.getElementById('create_resp').innerText = 'Generate failed: '+e;
  }finally{
    btn.disabled = false; btn.innerText = 'Generate';
  }
}

// -- Image -> Video
document.getElementById('iv_submit').addEventListener('click', async ()=>{
  const img = document.getElementById('iv_image').files[0];
  const voice = document.getElementById('iv_voice').files[0];
  if(!img) return alert('Please upload image');
  const fd = new FormData();
  fd.append('user_email','demo@visora.com');
  fd.append('title','Image2Video '+new Date().toISOString());
  fd.append('template','Cinematic');
  fd.append('quality','HD');
  fd.append('characters', img, img.name);
  if(voice) fd.append('character_voice_files', voice, voice.name);
  try{
    const r = await fetch(`${BASE_URL}/generate_video`, { method:'POST', body: fd });
    const j = await r.json();
    document.getElementById('iv_resp').innerHTML = `<pre>${escapeHtml(JSON.stringify(j,null,2))}</pre>`;
    await loadGallery();
  }catch(e){ document.getElementById('iv_resp').innerText = 'Error: '+e; }
});

// -- Script -> Video
document.getElementById('sv_submit').addEventListener('click', async ()=>{
  const script = document.getElementById('sv_script').value;
  if(!script) return alert('Script required');
  const fd = new FormData();
  fd.append('user_email','demo@visora.com');
  fd.append('title','ScriptVideo '+new Date().toISOString());
  fd.append('script', script);
  fd.append('template','Explainer');
  fd.append('quality','HD');
  try{
    const r = await fetch(`${BASE_URL}/generate_video`, { method:'POST', body: fd });
    const j = await r.json();
    document.getElementById('sv_resp').innerHTML = `<pre>${escapeHtml(JSON.stringify(j,null,2))}</pre>`;
    await loadGallery();
  }catch(e){ document.getElementById('sv_resp').innerText = 'Error: '+e; }
});

// -- Assistant (quick)
document.getElementById('assistant_quick_btn').addEventListener('click', async ()=>{
  const q = document.getElementById('assistant_quick_q').value || 'Give me a short hook';
  const tone = document.getElementById('assistant_tone').value;
  try{
    const res = await fetch(`${BASE_URL}/assistant`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({query:q, tone:tone, lang:'hi'})});
    const j = await res.json();
    document.getElementById('assistant_quick_reply').innerHTML = `<pre>${escapeHtml(j.reply || JSON.stringify(j))}</pre>`;
  }catch(e){ document.getElementById('assistant_quick_reply').innerText = 'Assistant failed'; }
});

// -- Assistant page
document.getElementById('as_call')?.addEventListener('click', async ()=>{
  const q = document.getElementById('as_q').value || 'Help me';
  const tone = document.getElementById('as_tone').value;
  try{
    const r = await fetch(`${BASE_URL}/assistant`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({query:q, tone:tone, lang:'hi'})});
    const j = await r.json();
    document.getElementById('as_reply').innerText = j.reply || JSON.stringify(j);
  }catch(e){ document.getElementById('as_reply').innerText='Error'; }
});

// -- Characters
document.getElementById('ch_save')?.addEventListener('click', async ()=>{
  const fd = new FormData();
  fd.append('user_email','demo@visora.com');
  fd.append('name', document.getElementById('ch_name').value || 'Character');
  const photo = document.getElementById('ch_photo').files[0];
  const voice = document.getElementById('ch_voice').files[0];
  if(photo) fd.append('photo', photo, photo.name);
  if(voice) fd.append('voice', voice, voice.name);
  try{
    const r = await fetch(`${BASE_URL}/character`, { method:'POST', body: fd });
    const j = await r.json();
    document.getElementById('ch_resp').innerHTML = `<pre>${escapeHtml(JSON.stringify(j,null,2))}</pre>`;
    await listCharacters();
  }catch(e){ document.getElementById('ch_resp').innerText='Save failed'; }
});
document.getElementById('ch_list_btn')?.addEventListener('click', listCharacters);
async function listCharacters(){
  try{
    const r = await fetch(`${BASE_URL}/characters?user_email=demo@visora.com`);
    const arr = await r.json();
    document.getElementById('ch_list').innerHTML = arr.map(c=>`<div class="muted">${escapeHtml(c.name)} ${c.photo?`<img src="${BASE_URL}/uploads/${encodeURIComponent(c.photo.split('/').pop())}" width="40" style="vertical-align:middle;margin-left:8px"/>` :''}</div>`).join('') || '<div class="muted">No characters</div>';
  }catch(e){ document.getElementById('ch_list').innerText='Load failed'; }
}

// -- Gallery
async function loadGallery(){
  try{
    const res = await fetch(`${BASE_URL}/gallery?user_email=demo@visora.com`);
    const arr = await res.json();
    const el = document.getElementById('galleryList');
    if(!Array.isArray(arr) || arr.length===0) { el.innerHTML = '<div class="muted">No videos yet</div>'; return; }
    el.innerHTML = arr.map(v=>`<div class="muted"><strong>${escapeHtml(v.title)}</strong> · ${escapeHtml(v.status)} ${v.file?` - <a href="${BASE_URL}/outputs/${encodeURIComponent(v.file.split('/').pop())}" target="_blank">Open</a>`:''}</div>`).join('');
  }catch(e){ document.getElementById('galleryList').innerText='Gallery load error'; }
}

// -- Profile
document.getElementById('profile_refresh')?.addEventListener('click', loadProfile);
async function loadProfile(){
  try{
    const r = await fetch(`${BASE_URL}/profile/demo@visora.com`);
    const j = await r.json();
    document.getElementById('profileBox').innerText = JSON.stringify(j, null, 2);
  }catch(e){ document.getElementById('profileBox').innerText='Profile load failed'; }
}

// poll jobs (optional)
async function loadJobs(){
  try{
    const res = await fetch(`${BASE_URL}/gallery?user_email=demo@visora.com`);
    const arr = await res.json();
    // map to jobs-list if exists
    const jobsList = document.getElementById('jobs-list');
    if(jobsList){
      jobsList.innerHTML = '';
      arr.slice(0,20).forEach(job=>{
        const li = document.createElement('li');
        li.textContent = `${job.id} - ${job.status}`;
        jobsList.appendChild(li);
      });
    }
  }catch(e){}
}
setInterval(loadJobs, 10000);

// init
showPage('dashboard'); refreshAll();

// small helper
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
