import React, { useState } from "react";

export default function VisoraApp() {
  const [activeTab, setActiveTab] = useState("create");
  const [script, setScript] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("en");

  // 🎤 Voice Recognition
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support voice recognition.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setScript((prev) => prev + " " + text);
    };
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen`}>
      {/* Navbar */}
      <header className={`${darkMode ? "bg-gray-800" : "bg-gray-200"} flex justify-between items-center px-6 py-4 shadow-md`}>
        <h1 className="text-xl font-bold text-yellow-400">Visora</h1>
        <nav className="flex space-x-4">
          {["assistant", "create", "myvideos", "analytics", "users", "settings", "payments", "notifications"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded ${
                activeTab === tab
                  ? "bg-yellow-400 text-black"
                  : "hover:bg-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1 bg-yellow-400 text-black rounded ml-4"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Assistant */}
        {activeTab === "assistant" && (
          <div className="p-6 rounded-xl shadow-md bg-gray-800">
            <h2 className="text-lg font-semibold mb-4">AI Assistant</h2>
            <textarea
              placeholder="Ask Visora Assistant anything..."
              className="w-full p-3 rounded bg-gray-700 text-white"
              rows="5"
            />
            <button className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300">
              Ask
            </button>
          </div>
        )}

        {/* Create Video */}
        {activeTab === "create" && (
          <div className="p-6 rounded-xl shadow-md bg-gray-800">
            <h2 className="text-lg font-semibold mb-4">Create Video</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Video Title"
                className="w-full p-3 rounded bg-gray-700 text-white"
              />
              <div className="relative">
                <textarea
                  placeholder="Script / Dialogue"
                  className="w-full p-3 rounded bg-gray-700 text-white"
                  rows="5"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className="absolute bottom-2 right-2 bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-300"
                >
                  🎤 Speak
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="p-3 rounded bg-gray-700 text-white">
                  <option>Motivation</option>
                  <option>Education</option>
                  <option>Entertainment</option>
                </select>
                <select className="p-3 rounded bg-gray-700 text-white">
                  <option>HD</option>
                  <option>Full HD</option>
                  <option>4K</option>
                </select>
                <select
                  className="p-3 rounded bg-gray-700 text-white"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="hi">Hindi</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                </select>
                <select className="p-3 rounded bg-gray-700 text-white">
                  <option>Short</option>
                  <option>Medium</option>
                  <option>Long</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Upload Character Images</label>
                <input type="file" multiple className="w-full text-gray-300" />
              </div>
              <div>
                <label className="block mb-1">Upload Voice Files</label>
                <input type="file" multiple className="w-full text-gray-300" />
              </div>
              <div>
                <label className="block mb-1">Export Options</label>
                <select className="p-3 rounded bg-gray-700 text-white w-full">
                  <option>MP4 Video</option>
                  <option>GIF Animation</option>
                  <option>Audio Only (MP3)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300"
              >
                Generate Video
              </button>
            </form>
          </div>
        )}

        {/* My Videos */}
        {activeTab === "myvideos" && (
          <div className="p-6 rounded-xl shadow-md bg-gray-800">
            <h2 className="text-lg font-semibold mb-4">My Videos</h2>
            <ul className="space-y-2">
              <li className="bg-gray-700 p-3 rounded flex justify-between items-center">
                Video_01.mp4
                <button className="bg-yellow-400 text-black px-2 py-1 rounded">Download</button>
              </li>
              <li className="bg-gray-700 p-3 rounded flex justify-between items-center">
                Video_02.mp4
                <button className="bg-yellow-400 text-black px-2 py-1 rounded">Download</button>
              </li>
            </ul>
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div className="p-6 rounded-xl shadow-md bg-gray-800">
            <h2 className="text-lg font-semibold mb-4">Analytics</h2>
            <p>Total Videos Created: 35</p>
            <p>Total Views: 4,520</p>
            <p>Subscribers: 120</p>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="p-6 rounded-xl shadow-md bg-gray-800">
            <h2 className="text-lg font-semibold mb-4">User Dashboard</h2>
            <p>👤 Demo User: demo@visora.com</p>
            <p>Videos Created: 12</p>
            <p>Subscription: Premium</p>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="p-6 rounded-xl shadow-md bg-gray-800">
            <h2 className="text-lg font-semibold mb-4">App Settings</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter API Key"
                className="w-full p-3 rounded bg-gray-700 text-white"
              />
              <button className="w-full px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300">
                Save API Key
              </button>
            </div>
          </div>
        )}

        {/* Payments */}
        {activeTab === "payments" && (
          <div className="p-6 rounded-xl shadow-md bg-gray-800">
            <h2 className="text-lg font-semibold mb-4">Subscription Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { plan: "Basic", price: "₹199/month", features: "10 Videos" },
                { plan: "Pro", price: "₹499/month", features: "50 Videos" },
                { plan: "Premium", price: "₹999/month", features: "Unlimited" },
              ].map((p) => (
                <div key={p.plan} className="bg-gray-700 p-4 rounded-xl text-center">
                  <h3 className="text-xl font-bold text-yellow-400">{p.plan}</h3>
                  <p className="text-lg mt-2">{p.price}</p>
                  <p className="text-sm text-gray-300">{p.features}</p>
                  <button className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300">
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <div className="p-6 rounded-xl shadow-md bg-gray-800">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <ul className="space-y-2">
              <li className="bg-gray-700 p-3 rounded">🔥 New feature: Export to GIF!</li>
              <li className="bg-gray-700 p-3 rounded">💳 Pro plan discount 20% valid till tomorrow</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
