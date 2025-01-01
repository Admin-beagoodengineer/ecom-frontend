import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import "./styles/app.scss";
// import MaintenancePage from './components/Maint.tsx'
import {Provider} from 'react-redux';
import { store } from './redux/store.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      {/* <MaintenancePage/> */}
    </Provider>
  </React.StrictMode>,
)
