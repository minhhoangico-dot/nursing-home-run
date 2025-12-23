import React from 'react';
import { createRoot } from 'react-dom/client';
import './src/index.css';
import App from './src/app/App';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}