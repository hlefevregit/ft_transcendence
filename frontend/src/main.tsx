import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import './styles/style.css'; // ton style custom
import './index.css'; // tailwind etc.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
