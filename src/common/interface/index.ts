interface Change {
  p: boolean;
}

interface Force {
  change: Change;
}

interface Verify {
  type: string;
}
interface Login {
  verify: Verify;
}
interface WukongSetting {
  force: Force;
  login: Login;
}
interface EgovaSetting {
  wukong: WukongSetting;
}
export interface WebSetting {
  [key: string]: unknown;
  serviceUrl: string;
  encrypt: boolean;
  serveUrl: string;
  packageUrl?: string | null;
  timeout: number;
  login: boolean;
  mapConfigUrl: string;
  encode: string;
  filterThemeCards: boolean;
  egova: EgovaSetting;
  gisServerUrl: string;
  serveTimeout: number;
  'login-title': string;
  createViewPopup: boolean;
  enableShortcutKeys: boolean;
  encodeWhiteList: string;
  isConversionMethod: boolean;
}

export interface AxiosData<T> {
  hasError: boolean;
  result: T;
  message: string;
}
