import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

function App() {
  return <main><h1>Auto-Coder sandbox</h1><p>Ready for an autonomous change.</p></main>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

