import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/index.css'
import App from './App.jsx'

// ── Theme Initializer ─────────────────────────────────────────────────────────
// Reads persisted theme from localStorage before first render.
// Sets data-theme="light" on <html> if previously chosen; defaults to dark.
const savedTheme = localStorage.getItem('es-theme');
if (savedTheme === 'light') {
  document.documentElement.dataset.theme = 'light';
} else {
  // Ensure clean dark-mode state (no data-theme attr = dark by default via :root)
  delete document.documentElement.dataset.theme;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
