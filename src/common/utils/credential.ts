import Cookies from 'js-cookie';

import Storage from './storage';

export interface User {
  [index: string]: any;
  userName?: string;
  password?: string;
}

export interface Permission {
  [index: string]: any;
  application?: any;
  resourceItems?: any;
  resourceMenus?: any;
}

export class Credential {
  private static cookies = Cookies;
  private static storage = Storage;
  public static remember = false;

  public static encryption: any = {
    publicKey: `
        -----BEGIN PUBLIC KEY-----
        MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDKX1Fs2JUD25zrAEwPnjnZC0az
        rl1XjGzGrJ64eb1lr9QVVOO2zGKZdqDLZD4Ut4Mp6GHMaqqFXKm+zN7IAXu+mqZb
        UrqUziHE5YGC02wObiZEzfa6V9a8ZvqpB+Z8KO+hAkkjzjMl+E+hDORpZmez3SMz
        etn7mcCeLw8/vmxz3QIDAQAB
        -----END PUBLIC KEY-----`,
    prKey: `
        -----BEGIN PUBLIC KEY-----
        MIICXgIBAAKBgQDKX1Fs2JUD25zrAEwPnjnZC0azrl1XjGzGrJ64eb1lr9QVVOO2
        zGKZdqDLZD4Ut4Mp6GHMaqqFXKm+zN7IAXu+mqZbUrqUziHE5YGC02wObiZEzfa6
        V9a8ZvqpB+Z8KO+hAkkjzjMl+E+hDORpZmez3SMzetn7mcCeLw8/vmxz3QIDAQAB
        AoGBAJBr6b4V6nJwXdHPyngy4PGl/HTqcK60BkTamALqzmEtU9tNU5z2yz7dy+6a
        wTsjo7Vao8CwNrUp5fHGXw65EEc1/3Iu2Fiix0XF7RP4NFSoxbBmzQW1nUK/5DFi
        4VR1uhEmdbgLwGabsdqzeUqhRKkRGAPVCotBjaDBOu0J3Mu5AkEA+SM7Ctu7evOv
        ZwjWrp9a5MGxJ9yLLabbIuWL+420jr2G6ojaTZ2ROA2DWWQPx4JqWxDHttomrb38
        dk2emP2WAwJBAM/yU58YRQ+dTeuTzNYC1JdWcs35n9+hoVP7y+x29CmcqDTPp3nR
        Bbbq88yMb2nZdlwthWi7BurNHsRJFqj0GJ8CQF5gJCuW1UxcJ2PGi1yW7R2e6fcJ
        qoden8B2aDKgmXdBAGyz7s5cE/jB1bH1H60aECPzFVSFCwXh5FMEUEHwPfUCQQC7
        JqZ57lbhebrSRcA58GwzFFvY40wu8gIHWvwqgti2xsZgWW+qZCPXf9gSBWaUhmJP
        Da0fGAxesGN7VyhswNuTAkEAzCFNqL/zwHXcwh9YyHTdk/bRWIJq49jTA+vbgGv0
        szKIvGRKoRbub3NEUiI80TDsCAvbJ6R80J7RjnpmShOwcA==
        -----END PUBLIC KEY-----`,
    encryptor: null,
    init: function () {
      //   this.encryptor = new JSEncrypt();
      //   this.encryptor.setPublicKey(this.publicKey);
      //   this.encryptor.setPrivateKey(this.prKey);
      //   Credential.cookies = this.cookies;
    },
    cookies: Cookies.withConverter({
      write: function (value) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return Credential.encryption.encryptor.encryptLong(
          typeof value === 'string' ? value : JSON.stringify(value),
        );
      },
      read: function (value) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return Credential.encryption.encryptor.decryptLong(value);
      },
    }),
  };

  public static get user(): Partial<User> {
    return this.storage.get('user') || {};
  }

  public static set user(user: User) {
    this.remember ? this.storage.set('user', user, { expires: 7 }) : this.storage.set('user', user);
  }

  public static get token(): string {
    return this.cookies.get(this.getKey('token'))!;
  }

  public static set token(token: string) {
    this.remember
      ? this.cookies.set(this.getKey('token'), token, { expires: 7 })
      : this.cookies.set(this.getKey('token'), token);
  }

  public static get tokenTemporary(): string {
    return this.cookies.get(this.getKey('temporaryTk'))!;
  }

  public static set tokenTemporary(temporaryTk: string) {
    this.cookies.set(this.getKey('temporaryTk'), temporaryTk);
  }

  public static clearTemporary() {
    this.cookies.remove(this.getKey('temporaryTk'));
  }

  public static get permission(): Permission[] {
    return (this.storage.get('permission') as Permission[]) || [];
  }

  public static set permission(permission: Permission[]) {
    this.remember
      ? this.storage.set('permission', permission, { expires: 7 })
      : this.storage.set('permission', permission);
  }

  public static clear(filed?: 'user' | 'token' | 'permission') {
    if (filed) {
      if (filed.includes('token')) {
        this.cookies.remove(this.getKey(filed));
      } else {
        this.storage.remove(filed);
      }
    } else {
      this.storage.remove('user');
      this.cookies.remove(this.getKey('token'));
      this.storage.remove('permission');
      this.storage.remove('encryptPublicKey');
    }
    this.clearTemporary();
  }

  private static getKey(filed: string): string {
    return `${location.hostname}_${location.pathname}_${filed}`;
  }
}
