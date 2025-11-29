import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Remove loading spinner once app loads
const rootElement = document.getElementById('root');
if (rootElement) {
  const loadingElement = rootElement.querySelector('.app-loading');
  if (loadingElement) {
    loadingElement.remove();
  }
}

ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

