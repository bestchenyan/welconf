import { Avatar, Col, Menu, Popover, Row } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Credential } from '@/common/utils/credential';
import { routes } from '@/router';

import './index.scss';

import { UserOutlined } from '@ant-design/icons';

import { axios } from '@/common/utils/axios';

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
  const navigate = useNavigate();

  const location = useLocation();
  // 当前路由路径
  const currentPath = location.pathname;
  const menuList =
    routes
      .find((item) => item.id === 'app')
      ?.children!.filter((item) => item.meta.header)
      .map((item) => {
        return {
          path: item.path,
          label: item.meta.title,
        };
      }) ?? [];

  const logOut = async () => {
    await axios.post('/oauth/extras/token/revoke');
    Credential.clear();
    navigate('/login');
  };
  const content = <div onClick={logOut}>退出登录 </div>;

  return (
    <header className="header">
      <Row>
        <Col className="logo" span={2}>
          LOGO
        </Col>
        <Col span={20}>
          <Menu className="menu" mode="horizontal" selectedKeys={[currentPath]}>
            {menuList.map((route) => (
              <Menu.Item key={route.path}>
                <Link to={route.path}>{route.label}</Link>
              </Menu.Item>
            ))}
          </Menu>
        </Col>
        <Col className="user" span={2}>
          <Popover content={content}>
            <Avatar icon={<UserOutlined />} />
          </Popover>
        </Col>
      </Row>
    </header>
  );
}
