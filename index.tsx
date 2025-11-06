import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/ui.css'; // <-- NEW: global UI styles

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// 🟢 UNLOCK AUDIO CONTEXT ON FIRST USER INTERACTION
let audioCtx: AudioContext | null = null;

function unlockAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume().then(() => {
      console.log("🔓 AudioContext unlocked and ready to play sound!");
    });
  }

  // Remove event listeners after unlock
  window.removeEventListener("click", unlockAudio);
  window.removeEventListener("touchstart", unlockAudio);
}

window.addEventListener("click", unlockAudio);
window.addEventListener("touchstart", unlockAudio);


const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
