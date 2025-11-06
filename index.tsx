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

(function setupAudioUnlock() {
  let unlocked = false;
  async function unlock() {
    if (unlocked) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === "suspended") await ctx.resume();
      try { ctx.close?.(); } catch {}
      unlocked = true;
      console.log("🔓 Audio unlocked");
    } catch {}
  }
  window.addEventListener("click", unlock, { once: true });
  window.addEventListener("touchstart", unlock, { once: true });
})();



const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
