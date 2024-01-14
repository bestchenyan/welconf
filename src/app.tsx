import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';

import router from './router';

export default function App() {
  return (
    <ConfigProvider>
      <RouterProvider router={router} fallbackElement={<p>Initial Load...</p>} />
    </ConfigProvider>
  );
}
