import React from 'react';
import ReactDOM from 'react-dom/client';

import '@assets/styles/index.scss';

import App from './app';
import Screen from '@/assets/styles/screen';
import initSettings from '@/common/utils/setting';

new Screen();

initSettings()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  })
  .catch((error) => console.error(error));
