import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const App = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Hello World</h1>
      <p>Test app is working</p>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container not found');
}
