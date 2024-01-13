import { createBrowserRouter, redirect } from 'react-router-dom';

import { Credential } from '@/common/utils/credential';
import Layout from '@/views/layout';
import LoginPage, { loader as loginLoader } from '@/views/login';

const routes = [
  {
    id: 'app',
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        meta: '首页',
        Component: PublicPage,
      },
      {
        path: 'protected',
        label: '保护页',
        loader: protectedLoader,
        Component: ProtectedPage,
      },
    ],
  },
  {
    path: 'login',
    loader: loginLoader,
    Component: LoginPage,
  },
];

const router = createBrowserRouter(routes);

function PublicPage() {
  return <h3>Public</h3>;
}

function protectedLoader() {
  // If the user is not logged in and tries to access `/protected`, we redirect
  // them to `/login` with a `from` parameter that allows login to redirect back
  // to this page upon successful authentication

  if (!Credential.token) {
    return redirect('/login?');
  }

  return null;
}

function ProtectedPage() {
  return <h3>Protected</h3>;
}
export { routes };
export default router;
