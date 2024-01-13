import { Col, Menu, Row } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';

import './index.scss';

import { useState } from 'react';

export default function Layout() {
  return (
    <article className="layout">
      <Header />
      <main>
        <Outlet />
      </main>
    </article>
  );
}

function Header() {
  const location = useLocation();
  // 当前路由路径
  const currentPath = location.pathname;

  const [menuList] = useState([
    { path: '/', label: '首页' },
    { path: '/protected', label: '保护页' },
  ]);

  return (
    <header className="header">
      <Row>
        <Col span={2}>col-8</Col>
        <Col span={20}>
          <Menu mode="horizontal" selectedKeys={[currentPath]}>
            {menuList.map((route) => (
              <Menu.Item key={route.path}>
                <Link to={route.path}>{route.label}</Link>
              </Menu.Item>
            ))}
          </Menu>
        </Col>
        <Col span={2}>col-8</Col>
      </Row>
    </header>
  );
}
