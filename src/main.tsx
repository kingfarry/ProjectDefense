import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';

// Get the root element
const container = document.getElementById('root');

// Ensure the root element exists
if (!container) {
  throw new Error("Root element with id 'root' not found");
}

// Create a root
const root = createRoot(container);

// Render the app
root.render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

