import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1>Test App</h1>
    <p>Basic React app is working!</p>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
