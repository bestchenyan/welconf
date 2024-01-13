import { ConfigProvider, theme } from 'antd';
import { RouterProvider } from 'react-router-dom';

import router from './router';

export default function App() {
  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <RouterProvider router={router} fallbackElement={<p>Initial Load...</p>} />
    </ConfigProvider>
  );
}
