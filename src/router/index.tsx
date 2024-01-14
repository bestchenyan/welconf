import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const Layout = lazy(() => import('@/views/layout'));
const Login = lazy(() => import('@/views/login'));
const Portal = lazy(() => import('@/views/app/portal'));
const Space = lazy(() => import('@/views/app/space'));

const routes = [
  {
    id: 'app',
    path: '/',
    Component: Layout,
    children: [
      {
        path: '/portal',
        meta: {
          title: '首页',
          header: true,
        },
        element: (
          <Suspense>
            <Portal />
          </Suspense>
        ),
      },
      {
        path: '/space',
        meta: {
          title: '我的空间',
          header: true,
        },
        element: (
          <Suspense>
            <Space />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: 'login',
    element: (
      <Suspense>
        <Login />
      </Suspense>
    ),
  },
];

const router = createBrowserRouter(routes);

export { routes };
export default router;
