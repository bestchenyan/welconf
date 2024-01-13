import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './app';
import initSettings from '@/common/utils/setting';

initSettings()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  })
  .catch((error) => console.error(error));
