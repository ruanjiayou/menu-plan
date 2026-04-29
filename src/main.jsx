import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import store from './store';
import { StoreProvider } from './contexts/store';

const root = createRoot(document.getElementById('root'));
root.render(<StoreProvider store={store}>
  <App />
</StoreProvider>);
