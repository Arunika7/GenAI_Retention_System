// import './instrumentation';
// Use dynamic import to prevent white screen on instrumentation failure
import('./instrumentation').catch(e => console.error('Instrumentation failed:', e));

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
