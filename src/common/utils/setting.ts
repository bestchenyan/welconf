import { assignIn, forEach, isEmpty, isPlainObject } from 'lodash-es';

import { WebSetting } from '../interface';
import { ResponseData } from '../interface/axios';
import axios from './axios';

const parseVal = (val: string, key: string) => {
  const isChange: Record<string, 'number' | 'boolean'> = {
    timeout: 'number',
    serveTimeout: 'number',
    login: 'boolean',
    popupSize: 'number',
    isConversionMethod: 'boolean',
    createViewPopup: 'boolean',
    P: 'boolean',
    enableShortcutKeys: 'boolean',
    filterThemeCards: 'boolean',
  };
  if (!isChange[key]) return val === 'null' ? '' : val;
  let returnVal;
  try {
    returnVal = val ? (JSON.parse(val) as boolean | number) : val;
  } catch (error) {
    console.error(error);
  }
  return returnVal;
};

const dealSeting = (data: Record<string, unknown>) => {
  forEach(data, (val, key) => {
    if (isPlainObject(val)) {
      if (!isEmpty(val)) data[key] = dealSeting(val as Record<string, unknown>);
    } else {
      data[key] = parseVal(val as string, key);
    }
  });
  return data;
};

export default function () {
  return new Promise((resolve, reject) => {
    axios
      .get<ResponseData<WebSetting>>('/free/option/group/web-setting')
      .then((res) => {
        if (!res || res.data.hasError) {
          console.error(res);
          reject(res);
          return;
        }
        window.webSetting = assignIn(window.webSetting, dealSeting(res.data.result));
        resolve(res);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}
