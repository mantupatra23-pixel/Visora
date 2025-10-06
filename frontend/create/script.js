const $ = id => document.getElementById(id);
const genScriptBtn = $('genScriptBtn');
const createBtn = $('createBtn');
const clearBtn = $('clearBtn');
const statusBox = $('status');
const previewBox = $('previewBox');
const previewAudio = $('previewAudio');

function setStatus(text, isError=false){
  statusBox.textContent = text;
  statusBox.style.color = isError ? "#ff6b6b" : "#a6ffb0";
}

function clearAll(){
  $('script').value = '';
  setStatus('Cleared all fields.');
  previewBox.textContent = 'Your video preview will appear here';
  previewAudio.style.display = 'none';
}

async function generateScript(){
  const prompt = $('script').value.trim();
  if(!prompt){ setStatus('⚠️ Please enter a topic or hint first.', true); return; }
  setStatus('🧠 Generating script...');
  try{
    const res = await fetch('/assistant/script',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
    const data = await res.json();
    $('script').value = data.reply || 'No response';
    setStatus('✅ Script generated successfully!');
  }catch(e){ setStatus('❌ Error generating script',true); }
}

async function createVideo(){
  const title = $('title').value.trim();
  const script = $('script').value.trim();
  const voice = $('voice').value;
  const template = $('template').value;
  const music = $('music').value;
  if(!script){ setStatus('⚠️ Write or generate a script first.', true); return; }
  setStatus('🎥 Creating your video...');
  try{
    const res = await fetch('/create/video',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,script,voice,template,music})});
    const data = await res.json();
    if(data.url){
      previewBox.innerHTML = `<a href="${data.url}" target="_blank">🎬 Watch Video</a>`;
      setStatus('✅ Video created successfully!');
    } else throw new Error(data.error || 'Unknown');
  }catch(e){ setStatus('❌ Network/Backend error',true); }
}

genScriptBtn.onclick = generateScript;
createBtn.onclick = createVideo;
clearBtn.onclick = clearAll;
