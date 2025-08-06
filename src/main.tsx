console.log('Starting main.tsx');

import { createRoot } from 'react-dom/client'

console.log('Importing App...');
import App from './App.tsx'

console.log('Importing CSS...');
import './index.css'

console.log('Creating root...');
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
} else {
  console.log('Root element found, rendering App...');
  createRoot(rootElement).render(<App />);
  console.log('App rendered successfully');
}
