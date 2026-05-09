import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import App from './App';
import DrawerMenu from 'drawer-menu'
import './index.css';
import 'swiper/css';

const root = createRoot(document.getElementById('root'));
root.render(<StrictMode>
  <DrawerMenu />
  <App />
</StrictMode>);
