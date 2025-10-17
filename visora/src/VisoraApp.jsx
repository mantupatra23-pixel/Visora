import React, { useState } from "react";

export default function VisoraApp() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [template, setTemplate] = useState("Motivation");
  const [quality, setQuality] = useState("HD");
  const [language, setLanguage] = useState("Hindi (hi)");
  const [length, setLength] = useState("Short");
  const [images, setImages] = useState([]);
  const [voices, setVoices] = useState([]);
  const [videos, setVideos] = useState([]);
  const [listening, setListening] = useState(false);
  const [plan, setPlan] = useState("free");

  // 🎤 Voice Assistant
  const startListening = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "hi-IN";
    recognition.start();
    recognition.onresult = (e) => {
      setScript(script + " " + e.results[0][0].transcript);
    };
    setListening(true);
    recognition.onend = () => setListening(false);
  };

  // File Uploads
  const handleImageUpload = (e) => setImages([...e.target.files]);
  const handleVoiceUpload = (e) => setVoices([...e.target.files]);

  // 🎬 Video Create
  const handleSubmit = async () => {
    if (!script.trim()) {
      alert("⚠️ Please enter script before creating video.");
      return;
    }
    alert("🎬 Creating video...");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("script", script);
      formData.append("template", template);
      formData.append("quality", quality);
      formData.append("language", language);
      formData.append("length", length);
      images.forEach((img) => formData.append("images", img));
      voices.forEach((v) => formData.append("voices", v));

      const res = await fetch("https://your-backend.onrender.com/create", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setVideos([...videos, { title, url: data.url, status: "Completed" }]);
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      alert("🚨 Backend error.");
    }
  };

  // 🔑 Auth Page
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">
          Visora AI Studio
        </h1>
        <button
          onClick={() => setUser("guest")}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-bold mb-3"
        >
          🚀 Continue as Guest
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
          🔐 Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Visora AI Studio</h1>

      {/* Video Creator */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">🎥 Create Video</h2>

        <input
          type="text"
          placeholder="Video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-lg mb-3 text-black"
        />

        <textarea
          placeholder="Enter script here..."
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="w-full p-3 rounded-lg mb-3 text-black h-28"
        />

        <button
          onClick={startListening}
          className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg mb-3"
        >
          {listening ? "🎤 Listening..." : "🎤 Speak Script"}
        </button>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="p-3 rounded-lg text-black"
          >
            <option>Motivation</option>
            <option>Education</option>
            <option>Entertainment</option>
            <option>Custom</option>
          </select>

          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="p-3 rounded-lg text-black"
          >
            <option>HD</option>
            <option>Full HD</option>
            <option>Ultra HD</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-3 rounded-lg text-black"
          >
            <option>Hindi (hi)</option>
            <option>English (en)</option>
            <option>Bengali (bn)</option>
          </select>

          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="p-3 rounded-lg text-black"
          >
            <option>Short</option>
            <option>Medium</option>
            <option>Long</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block mb-1">Upload Character Images</label>
          <input type="file" multiple onChange={handleImageUpload} className="text-white" />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Upload Voice Files (optional)</label>
          <input type="file" multiple onChange={handleVoiceUpload} className="text-white" />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold p-3 rounded-lg"
        >
          🚀 Create Video
        </button>
      </div>

      {/* My Videos */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">📂 My Videos</h2>
        {videos.length === 0 ? (
          <p>No videos yet. Create one!</p>
        ) : (
          videos.map((v, i) => (
            <div key={i} className="bg-gray-700 p-3 rounded-lg mb-2">
              <p className="font-bold">{v.title}</p>
              <p>Status: {v.status}</p>
              {v.url && (
                <a
                  href={v.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline"
                >
                  Download
                </a>
              )}
            </div>
          ))
        )}
      </div>

      {/* Subscription Plans */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">💳 Subscription Plans</h2>
        <div className="space-y-3">
          <button
            onClick={() => setPlan("starter")}
            className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-lg"
          >
            Starter – HD – ₹199/mo
          </button>
          <button
            onClick={() => setPlan("pro")}
            className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-lg"
          >
            Pro – Full HD – ₹499/mo
          </button>
          <button
            onClick={() => setPlan("ultra")}
            className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-lg"
          >
            Ultra – Ultra HD – ₹999/mo
          </button>
        </div>
        <p className="mt-3">Current Plan: {plan}</p>
      </div>
    </div>
  );
}
