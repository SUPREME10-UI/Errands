import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '../public/css/tailwind.css';
import '../public/css/variables.css';
import '../public/css/main.css';
import '../public/css/auth.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
