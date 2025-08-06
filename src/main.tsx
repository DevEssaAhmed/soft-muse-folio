import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const App = () => (
  <div className="min-h-screen bg-background text-foreground p-8">
    <h1 className="text-4xl font-bold">Portfolio App</h1>
    <p className="text-lg mt-4">Application is working!</p>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
