import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/components.css';
import './styles/home.css';
import './styles/auth-profile.css';
import './styles/tests.css';
import './styles/about.css';
import './styles/profile.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
