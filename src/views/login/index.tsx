import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input } from 'antd';
import JSEncrypt from 'jsencrypt';
import { useNavigate } from 'react-router-dom';
import { sm2 } from 'sm-crypto';

import { ResponseData } from '@/common/interface/axios';
import { AuthToken } from '@/common/interface/oauth';
import { Credential } from '@/common/utils/credential';
import Storage from '@/common/utils/storage';

import './index.scss';

import { axios } from '@/common/utils/axios';

interface FormData {
  username: string;
  password: string;
  remember: boolean;
}

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values: FormData) => {
    await login(values);
  };

  const login = async (values: FormData) => {
    const { username, password } = values;
    const encryptPass = (await getEncrypt(password)) as string;
    const params = {
      client_id: 'unity-client',
      client_secret: 'unity',
      grant_type: 'password',
      password: encryptPass,
      username: username,
    };
    const { data: result } = await axios.post<AuthToken>('/oauth/extras/token', params);
    if (!result.access_token) {
      console.error('登录失败:', result);
      logOut();
      return;
    }

    Credential.tokenTemporary = result.access_token;
    Credential.user = result.user;
    navigate('/space');
  };

  return (
    <div className="login">
      <Form
        name="login"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your Username!' }]}
        >
          <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-form-button">
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export function logOut() {
  Credential.clear();
}

async function getEncrypt(password: string) {
  const publicKey = await getPublicKey();
  Storage.set('encryptPublicKey', publicKey.result);
  if (!publicKey?.result) return password;
  const encryptType = await getEncryptType();
  Storage.set('encryptPublicType', encryptType?.result);
  if (encryptType?.result === 'rsa') {
    const encryptor = new JSEncrypt() as unknown;
    (encryptor as { setPublicKey: (val: string) => void }).setPublicKey(publicKey.result);
    return (encryptor as { encrypt: (val: string) => void }).encrypt(password);
  } else if (encryptType?.result === 'sm2') {
    return sm2.doEncrypt(password, publicKey.result, 1);
  } else {
    return password;
  }
}

async function getPublicKey() {
  const result = await axios.get<ResponseData<string>>('/oauth/extras/public-key');
  return result.data;
}

async function getEncryptType() {
  const result = await axios.get<ResponseData<'sm2' | 'rsa'>>('/oauth/extras/alg');
  return result.data;
}
