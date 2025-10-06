// frontend/create/script.js
// Basic front-end logic to call backend routes.
// Adjust endpoint paths if your backend uses different names.

const $ = id => document.getElementById(id);

const genScriptBtn = $('genScriptBtn');
const createBtn = $('createBtn');
const statusBox = $('status');
const previewBox = $('previewBox');
const previewAudio = $('previewAudio');

function setStatus(text, isError=false) {
  statusBox.textContent = text;
  statusBox.style.color = isError ? '#ff6b6b' : '#a6ffb0';
}

function clearPreview() {
  previewBox.textContent = 'No preview yet.';
  previewAudio.style.display = 'none';
  previewAudio.src = '';
}

async function generateScript() {
  const prompt = $('script').value.trim();
  if (!prompt) {
    setStatus('Enter a prompt first to generate script.', true);
    return;
  }
  setStatus('Generating script...');

  try {
    const res = await fetch('/assistant/script', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error('Server returned: ' + text.slice(0,200));
    }
    const data = await res.json();
    if (data.reply) {
      $('script').value = data.reply;
      setStatus('Script generated.');
      previewBox.textContent = data.reply.slice(0,100) + (data.reply.length>100?'...':'');
    } else {
      throw new Error('No reply from server');
    }
  } catch (err) {
    console.error(err);
    setStatus('Error generating script: ' + err.message, true);
  }
}

async function createVideo() {
  const title = $('title').value.trim();
  const script = $('script').value.trim();
  const voice = $('voice').value;
  const template = $('template').value;
  const music = $('music').value;

  if (!title || !script) {
    setStatus('Please provide title and script before creating video.', true);
    return;
  }

  setStatus('Creating video, please wait... this may take a while.');
  previewBox.textContent = 'Working...';

  try {
    const res = await fetch('/create/video', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title, script, voice, template, music })
    });

    // If server returns HTML error, it will fail at json()
    const data = await res.json();

    if (res.ok && data.jobId) {
      setStatus(`Video job started (id: ${data.jobId}). Polling status...`);
      pollJobStatus(data.jobId);
    } else if (data.error) {
      throw new Error(data.error);
    } else {
      throw new Error('Unexpected response from server');
    }
  } catch (err) {
    console.error(err);
    setStatus('Network or Backend Error: ' + err.message, true);
    // If server returned HTML (Unexpected token '<'), suggest checking backend.
    if (err.message.includes('<')) {
      setStatus('Backend returned HTML (check your API routes).', true);
    }
  }
}

async function pollJobStatus(jobId) {
  // Poll /create/video/status?jobId=<id> (optional route - implement on server)
  // We'll try 6 times with 5s interval.
  let attempts = 0;
  const maxAttempts = 12;
  const interval = 4000;

  const check = async () => {
    attempts++;
    try {
      const res = await fetch(`/create/video/status?jobId=${encodeURIComponent(jobId)}`);
      if (!res.ok) throw new Error('status fetch failed');
      const data = await res.json();

      if (data.status === 'done' && data.url) {
        setStatus('Video ready!');
        previewBox.innerHTML = `<a href="${data.url}" target="_blank">Download / Preview Video</a>`;
        // if server returned an audio preview on `audioUrl`
        if (data.audioUrl) {
          previewAudio.src = data.audioUrl;
          previewAudio.style.display = 'block';
        }
        return;
      } else if (data.status === 'processing') {
        setStatus(`Processing... (${(data.progress||0)}%)`);
      } else if (data.status === 'failed') {
        setStatus('Video creation failed: ' + (data.error||'unknown'), true);
        return;
      } else {
        setStatus('Job status: ' + (data.status || 'unknown'));
      }
    } catch (err) {
      console.warn('poll error', err);
      // don't spam user with errors; try again a few times
    }

    if (attempts < maxAttempts) {
      setTimeout(check, interval);
    } else {
      setStatus('Still processing. Check your dashboard later (jobId: ' + jobId + ')');
    }
  };

  check();
}

// event wiring
genScriptBtn.addEventListener('click', generateScript);
createBtn.addEventListener('click', createVideo);

// on load
clearPreview();
