// Visora - Single-file React + Tailwind frontend // Save as: src/App.jsx (or replace your existing App.jsx) // Instructions: set BASE_API in environment or at top of file, run npm install (react, axios, tailwindcss), build normally.

import React, { useEffect, useState, useRef } from "react"; import axios from "axios";

// === CONFIG === // Change this to your deployed backend (Render) before building const BASE_API = process.env.REACT_APP_BASE_API || "https://visora.onrender.com";

// Tiny helper to create object URL for previews const fileToObjectUrl = (file) => (file ? URL.createObjectURL(file) : null);

export default function App() { const [page, setPage] = useState("dashboard"); const [loading, setLoading] = useState(false); const [credits, setCredits] = useState(5); const [videos, setVideos] = useState([]); const [templates, setTemplates] = useState([]); const [toast, setToast] = useState(null);

useEffect(() => { fetchTemplates(); fetchGallery(); }, []);

const fetchTemplates = async () => { try { const res = await axios.get(${BASE_API}/templates/trending); setTemplates(res.data || []); } catch (e) { console.warn("templates fetch failed", e?.message); } };

const fetchGallery = async () => { try { setLoading(true); const res = await axios.get(${BASE_API}/gallery, { params: { user_email: "demo@visora.com" } }); setVideos(res.data || []); } catch (e) { console.warn("gallery fetch failed", e?.message); setVideos([]); } finally { setLoading(false); } };

const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 4000); };

return ( <div className="min-h-screen bg-[#14151B] text-white font-sans"> <TopBar credits={credits} onUpgrade={() => showToast("Open payments page") } /> <div className="flex"> <SideNav page={page} setPage={setPage} /> <main className="flex-1 p-6"> {page === "dashboard" && ( <Dashboard templates={templates} videos={videos} loading={loading} onRefresh={fetchGallery} onCreate={() => setPage("create")} /> )} {page === "create" && <CreateVideo onDone={() => { showToast("Render queued"); setPage("gallery"); fetchGallery(); }} />} {page === "gallery" && <Gallery videos={videos} loading={loading} onRefresh={fetchGallery} />} {page === "assets" && <Assets templates={templates} />} {page === "profile" && <Profile />} </main> </div>

{toast && <div className="fixed bottom-6 right-6 bg-amber-400 text-black px-4 py-2 rounded">{toast}</div>}
</div>

); }

function TopBar({ credits = 0, onUpgrade }) { return ( <header className="flex items-center justify-between px-6 py-3 bg-[#18191F] border-b border-[#222]"> <div className="flex items-center gap-3"> <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">V</div> <h1 className="text-xl font-semibold">Visora</h1> </div> <div className="flex items-center gap-4"> <div className="text-sm text-gray-300">Credits: <span className="text-green-400">{credits}</span></div> <button onClick={onUpgrade} className="bg-amber-400 text-black px-3 py-1 rounded">Upgrade</button> </div> </header> ); }

function SideNav({ page, setPage }) { const items = [ { key: "dashboard", label: "Home", icon: "🏠" }, { key: "create", label: "Create", icon: "🎬" }, { key: "gallery", label: "Gallery", icon: "🎞️" }, { key: "assets", label: "Assets", icon: "🗂️" }, { key: "profile", label: "Profile", icon: "👤" }, ]; return ( <aside className="w-72 p-4 bg-[#18191F] min-h-[calc(100vh-64px)] border-r border-[#222]"> <div className="mb-4"> <div className="text-gray-400 mb-2">Quick Actions</div> <div className="grid grid-cols-2 gap-2"> <button onClick={() => setPage('create')} className="bg-[#222227] p-2 rounded text-sm">Text → Video</button> <button onClick={() => setPage('create')} className="bg-[#222227] p-2 rounded text-sm">Image → Video</button> </div> </div> <nav className="flex flex-col gap-1"> {items.map(i => ( <button key={i.key} onClick={() => setPage(i.key)} className={text-left px-3 py-2 rounded ${page===i.key? 'bg-[#222227]':''}}>{i.icon} {i.label}</button> ))} </nav> </aside> ); }

function Dashboard({ templates, videos, loading, onRefresh, onCreate }) { return ( <div> <div className="flex items-center justify-between mb-6"> <h2 className="text-2xl">Dashboard</h2> <div className="flex gap-2"> <button onClick={onRefresh} className="px-3 py-1 bg-[#222227] rounded">Refresh</button> <button onClick={onCreate} className="px-3 py-1 bg-amber-400 text-black rounded">Create Video</button> </div> </div>

<section className="mb-6">
    <h3 className="text-lg mb-2">Trending Templates</h3>
    <div className="flex gap-3 overflow-x-auto">
      {templates.length===0 ? <div className="text-gray-500">No templates</div> : templates.map(t => (
        <div key={t.name} className="min-w-[160px] bg-[#21222A] p-3 rounded">
          <div className="h-24 bg-gray-600 rounded mb-2" />
          <div className="font-semibold">{t.name}</div>
          <div className="text-xs text-gray-400">{t.category}</div>
        </div>
      ))}
    </div>
  </section>

  <section>
    <h3 className="text-lg mb-2">Recent Videos</h3>
    {loading ? <div>Loading...</div> : (
      videos.length===0 ? <div className="text-gray-400">No videos yet</div> : (
        <div className="grid grid-cols-2 gap-3">
          {videos.map(v => (
            <div key={v.id} className="bg-[#21222A] p-3 rounded">
              <div className="h-36 bg-black mb-2 flex items-center justify-center text-gray-400">Preview</div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{v.title}</div>
                  <div className="text-xs text-gray-400">{new Date(v.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <a href={`${BASE_API}/outputs/${v.file}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-amber-400 text-black rounded">Download</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    )}
  </section>
</div>

); }

function CreateVideo({ onDone }) { const [title, setTitle] = useState(""); const [script, setScript] = useState(""); const [template, setTemplate] = useState("Motivation"); const [quality, setQuality] = useState("HD"); const [lang, setLang] = useState("hi"); const [images, setImages] = useState([]); const [voices, setVoices] = useState([]); const [bgMusic, setBgMusic] = useState(null); const [rendering, setRendering] = useState(false); const fileRef = useRef();

const pickImages = async (e) => { const files = Array.from(e.target.files || []); setImages(files); }; const pickVoices = async (e) => setVoices(Array.from(e.target.files || [])); const pickBg = async (e) => setBgMusic(e.target.files && e.target.files[0]);

const submit = async () => { try { setRendering(true); const form = new FormData(); form.append('user_email','demo@visora.com'); form.append('title', title || Video ${new Date().toISOString()}); form.append('script', script); form.append('template', template); form.append('quality', quality); form.append('lang', lang);

images.forEach(f => form.append('characters', f));
  voices.forEach(v => form.append('character_voice_files', v));
  if (bgMusic) form.append('bg_music_file', bgMusic);

  const res = await axios.post(`${BASE_API}/generate_video`, form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 10*60*1000 });
  if (res.status === 200) {
    onDone && onDone(res.data);
  } else {
    alert('Render failed: ' + res.status);
  }
} catch (e) {
  console.error('create video error', e);
  alert('Error: ' + (e.response?.data?.error || e.message));
} finally {
  setRendering(false);
}

};

return ( <div> <h2 className="text-2xl mb-4">Create Video</h2> <div className="grid grid-cols-2 gap-4"> <div> <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 bg-[#111214] rounded mb-2" placeholder="Title" /> <textarea value={script} onChange={e=>setScript(e.target.value)} rows={8} className="w-full p-2 bg-[#111214] rounded" placeholder="Enter script or let assistant help"></textarea> </div> <div> <div className="mb-2"> <label className="block text-sm">Template</label> <select value={template} onChange={e=>setTemplate(e.target.value)} className="w-full p-2 bg-[#111214] rounded"> <option>Motivation</option> <option>Promo</option> <option>Explainer</option> <option>Cinematic</option> </select> </div> <div className="mb-2 flex gap-2"> <select value={quality} onChange={e=>setQuality(e.target.value)} className="flex-1 p-2 bg-[#111214] rounded"> <option>HD</option> <option>FULLHD</option> <option>4K</option> </select> <select value={lang} onChange={e=>setLang(e.target.value)} className="w-28 p-2 bg-[#111214] rounded"> <option value="hi">hi</option> <option value="en">en</option> <option value="bn">bn</option> <option value="ta">ta</option> </select> </div>

<div className="mb-2">
        <label className="block text-sm mb-1">Upload Characters (images)</label>
        <input type="file" accept="image/*" multiple onChange={pickImages} />
        <div className="flex gap-2 mt-2">
          {images.map((f, idx) => (
            <img key={idx} src={fileToObjectUrl(f)} alt="img" className="w-20 h-20 object-cover rounded" />
          ))}
        </div>
      </div>

      <div className="mb-2">
        <label className="block text-sm mb-1">Upload Voices (optional)</label>
        <input type="file" accept="audio/*" multiple onChange={pickVoices} />
        <div className="text-sm text-gray-400 mt-1">Provided voices will be used in order for characters. If missing, TTS will be used.</div>
      </div>

      <div className="mb-2">
        <label className="block text-sm mb-1">Background music (optional)</label>
        <input type="file" accept="audio/*" onChange={pickBg} />
        {bgMusic && <div className="mt-2">Selected: {bgMusic.name}</div>}
      </div>

      <div className="mt-4">
        <button onClick={submit} disabled={rendering} className="px-4 py-2 bg-amber-400 text-black rounded">{rendering ? 'Rendering...' : 'Render & Generate'}</button>
      </div>
    </div>
  </div>

</div>

); }

function Gallery({ videos = [], loading, onRefresh }) { return ( <div> <div className="flex items-center justify-between mb-4"> <h2 className="text-2xl">Gallery</h2> <button onClick={onRefresh} className="px-3 py-1 bg-[#222227] rounded">Refresh</button> </div> {loading ? <div>Loading...</div> : ( <div className="grid grid-cols-3 gap-3"> {videos.length===0 ? <div className="text-gray-400">No videos yet</div> : videos.map(v => ( <div key={v.id} className="bg-[#21222A] p-3 rounded"> <div className="h-40 bg-black mb-2 flex items-center justify-center text-gray-400">Preview</div> <div className="flex justify-between items-center"> <div> <div className="font-semibold">{v.title}</div> <div className="text-xs text-gray-400">{new Date(v.created_at).toLocaleString()}</div> </div> <a className="px-2 py-1 bg-amber-400 text-black rounded" href={${BASE_API}/outputs/${v.file}} target="_blank" rel="noreferrer">Download</a> </div> </div> ))} </div> )} </div> ); }

function Assets({ templates = [] }) { return ( <div> <h2 className="text-2xl mb-4">Assets & Templates</h2> <div className="grid grid-cols-3 gap-3"> {templates.length===0 ? <div className="text-gray-400">No templates</div> : templates.map(t => ( <div key={t.name} className="bg-[#21222A] p-3 rounded"> <div className="h-32 bg-gray-600 mb-2" /> <div className="font-semibold">{t.name}</div> <div className="text-xs text-gray-400">{t.category}</div> </div> ))} </div> </div> ); }

function Profile() { return ( <div> <h2 className="text-2xl mb-4">Profile</h2> <div className="bg-[#21222A] p-4 rounded w-96"> <div className="flex gap-4 items-center"> <div className="w-20 h-20 bg-gray-700 rounded-full" /> <div> <div className="font-semibold">Demo User</div> <div className="text-sm text-gray-400">demo@visora.com</div> </div> </div> <div className="mt-4"> <button className="px-3 py-1 bg-[#222227] rounded">Edit Profile</button> </div> </div> </div> ); }

