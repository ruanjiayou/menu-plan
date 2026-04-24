import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import store from './store';
import { StoreProvider } from './contexts/store';

ReactDOM.render(<StoreProvider store={store}>
  <App />
</StoreProvider>, document.getElementById('root'));