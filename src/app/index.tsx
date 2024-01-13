import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div>
      <p>header</p>
      <Outlet />
    </div>
  );
}
