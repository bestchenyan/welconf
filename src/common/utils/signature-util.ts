import Axios from 'axios';
import { HmacSHA1 } from 'crypto-js';
import Base64 from 'crypto-js/enc-base64';
import { isNumber, isString } from 'lodash-es';

import { RequestConfig } from './axios';

const getRandomNumber = () => window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SignatureUtil {
  const options = {
    signature: true, // 是否开启签名
    ak: 'ad13dec6216acac85e91562821bf8dda', // 必填
    appId: 'wukong', // 可选
    defaultContentType: 'application/json',
    ignoreParams: ['_'], // 后端会忽略计算的params
  };

  (function () {
    if (!window._nonce_prefix) {
      window._nonce_prefix = randomString(10);
    }
  })();

  // eslint-disable-next-line no-inner-declarations
  export function useSignature(axiosInstance?: typeof Axios) {
    const axios = axiosInstance ?? Axios;
    axios.interceptors.request.use(
      (config) => {
        signature(config);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  // eslint-disable-next-line no-inner-declarations
  export function randomString(length = 10) {
    return getRandomNumber().toString(32).substr(2, length);
  }

  // eslint-disable-next-line no-inner-declarations
  export function getSortedParamsStr(
    params: Record<string, unknown>,
    encodeFunc: (str: string) => string,
  ) {
    if (Object.prototype.toString.call(params) !== '[object Object]') {
      return params;
    }
    const keys = Object.keys(params).sort();

    let allParamsStrToSign = '';
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = params[key] ?? '';

      //get或multipart/form-data形式的post
      //走标准请求的url参数在 buildUrl 中已encode
      //对应encodeUriQuery中的特殊处理（空格不需要还原，java端就是要+）
      if (Array.isArray(val)) {
        val.forEach((v: string, index) => {
          allParamsStrToSign = allParamsStrToSign + key + '=' + encodeFunc(v);
          if (index < val.length - 1) {
            allParamsStrToSign += '&';
          }
        });
      } else {
        allParamsStrToSign = allParamsStrToSign + key + '=' + encodeFunc(val as string);
      }
      if (i !== keys.length - 1) {
        allParamsStrToSign += '&';
      }
    }
    return allParamsStrToSign;
  }

  /**
   * 将url中的参数重新进行编码以便与后端计算的签名保持一致
   * （需要先对应encodeUriQuery中的特殊还原进行处理）
   * @param {string} param url中已encode后的参数值（注意标准http的get请求前会将参数值进行encodeUriQuery）
   */
  // eslint-disable-next-line no-inner-declarations
  export function encodeUrlParamToSign(param: string) {
    return (
      (param + '')
        .replace(/@/g, '%40')
        .replace(/:/g, '%3A')
        .replace(/\$/g, '%24')
        .replace(/,/g, '%2C')
        .replace(/;/g, '%3B')
        //上面是还原特殊处理，下面是和后端encode保持一致
        .replace(/%2B/g, '+')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/'/g, '%27')
        .replace(/!/g, '%21')
        .replace(/~/g, '%7E')
    );
  }

  // eslint-disable-next-line no-inner-declarations
  export function encodeUriQuery(val: string, pctEncodeSpaces = false) {
    let pctReplaceValue = '+';
    if (pctEncodeSpaces) {
      pctReplaceValue = '%20';
    }
    return encodeURIComponent(val)
      .replace(/%40/gi, '@')
      .replace(/%3A/gi, ':')
      .replace(/%24/g, '$')
      .replace(/%2C/gi, ',')
      .replace(/%3B/gi, ';')
      .replace(/%20/g, pctReplaceValue);
  }

  /**
   * 对应 encodeUriQuery 的相反操作
   */
  // eslint-disable-next-line no-inner-declarations
  export function decodeUriQuery(val: string) {
    return decodeURIComponent(
      (val + '')
        .replace(/@/gi, '%40')
        .replace(/:/gi, '%3A')
        .replace(/\$/g, '%24')
        .replace(/,/gi, '%2C')
        .replace(/;/gi, '%3B')
        .replace(/\+/g, '%20'),
    );
  }

  /**
   * 将form表单参数进行url编码，同时针对http表单请求的编码标准进行替换（替换逻辑与城管mis代码保持一致）。
   * （encodeURIComponent 和 x-www-form-urlencoded、multipart/form-data 的标准不一致，例如空格的编码，前者要求是 %20 ，后者是 +）
   * H5和Java、Android在url编码上的差别：
   * 1. H5中 encodeURIComponent 对 !’()~ 这5个字符不编码，java端 URLEncoder.encode 会编码成 %21%27%28%29%7E 。
   * 2. H5中 encodeURIComponent 对空格的编码结果为 %20 ，java端 URLEncoder.encode 编码后为 + 。
   * 另外注意，付总单独提的，encodeURIComponent('+')之后的结果%2B也需要替换为+。
   * @param {string} param form表单参数
   * @return {string} encode之后的表单参数
   */
  // eslint-disable-next-line no-inner-declarations
  export function encodeBodyParamToSign(param: string): string {
    return encodeURIComponent(param)
      .replace(/%2B/g, '+')
      .replace(/%20/g, '+')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/'/g, '%27')
      .replace(/!/g, '%21')
      .replace(/~/g, '%7E');
  }

  // eslint-disable-next-line no-inner-declarations
  export function encode(str: string) {
    return encodeURIComponent(str)
      .replace(/%2B/g, '+')
      .replace(/%20/g, '+')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/'/g, '%27')
      .replace(/!/g, '%21')
      .replace(/~/g, '%7E');
  }

  // eslint-disable-next-line no-inner-declarations
  export function getUrlQueryParams(url: string, encodeFunc: (str: string) => string) {
    const queryParams: Record<string, unknown[]> = {};
    const questionIndex = url.indexOf('?');
    if (questionIndex >= 0) {
      const paramStr = url.substring(questionIndex + 1);
      const pairArr = paramStr.split('&');
      pairArr.forEach((pair) => {
        const queryStr = pair.split('=');
        if (queryStr.length === 2) {
          //对已经encode的key进行还原
          const key = decodeUriQuery(queryStr[0]);
          // queryParams[key] = queryStr[1];
          //url中参数key可能重复（比如批量批转），使用数组存储
          if (key in queryParams && Array.isArray(queryParams[key])) {
            queryParams[key].push(encodeFunc(queryStr[1]));
          } else {
            queryParams[key] = [encodeFunc(queryStr[1])];
          }
        }
      });
    }
    return queryParams;
  }

  // eslint-disable-next-line no-inner-declarations
  export function removeUrlQueryParams(url: string, badKeys: string[]) {
    const questionIndex = url.indexOf('?');
    let retUrl = url;
    if (questionIndex >= 0) {
      retUrl = url.substring(0, questionIndex + 1);
      const paramStr = url.substring(questionIndex + 1);
      if (paramStr.indexOf('?') > -1) {
        console.error('签名错误：url格式错误, ' + url);
        return url;
      }

      const pairArr = paramStr.split('&');
      let leftParamCount = 0;
      for (const pair of pairArr) {
        const queryStr = pair.split('=');
        if (queryStr.length === 2) {
          //对已经encode的key进行还原
          const key = decodeUriQuery(queryStr[0]);
          if (badKeys.includes(key)) {
            // do nothing for remove
          } else {
            if (leftParamCount > 0) {
              retUrl += '&';
            }
            retUrl += key + '=' + queryStr[1];
            leftParamCount++;
          }
        }
      }
    }
    return retUrl;
  }

  // eslint-disable-next-line no-inner-declarations
  export function signature(config: RequestConfig): RequestConfig {
    if (!options.signature) {
      return config;
    }
    if (!options.ak) {
      return config;
    }
    if (!options.appId) {
      return config;
    }
    if (!config.url) {
      return config;
    }

    //鉴权需要的请求头参数
    if (!config.headers) {
      config.headers = {};
    }
    config.headers['App-Id'] = options.appId;

    const method = config.method?.toUpperCase();
    const isPost = method === 'POST';
    const isGet = method === 'GET';
    if (!isGet && !isPost) {
      return config;
    }
    let isFormUrlEncoded = false;
    let isMultipartForm = false;
    let isJsonData = false;
    let isFormData = false;
    if (isPost) {
      let contentType = config.headers['Content-Type'] as string;
      if (!contentType) {
        contentType = options.defaultContentType;
      }
      isFormUrlEncoded = contentType.indexOf('application/x-www-form-urlencoded') >= 0;
      isMultipartForm = contentType.indexOf('multipart/form-data') >= 0;
      isJsonData = contentType.indexOf('application/json') >= 0;
      isFormData = config.data instanceof FormData;
      if (!isFormUrlEncoded && !isMultipartForm && !isJsonData) {
        return config;
      }
    }

    // 时间戳参数： 每次请求时发送
    const timestamp = parseInt(new Date().getTime() / 1000 + '') + '';
    // nonce 随机参数： randomString_randomString
    const nonce = `${window._nonce_prefix}_${randomString(10)}`;

    /**
     * signature 参数：
     * 参数格式： base64(hmac_sha1(url + "?" + encodeURI(sorted_params)), ak)
     * 其中：
     * url为去除 origin，路径参数后的地址，且确保其中不含后// 双斜杠；
     * hmac_sha1为加密算法，可以直接使用类库crypto-js
     * ak 参数，与后端服务一一对应，每一个拥有独立后台服务的前端均使用不同的ak。
     * 若前端对应了多个后端，则前端独立使用一个ak, 且header中增加参数App-Id=XXX
     *
     */

    // query参数处理, 添加timestamp和nonce
    config.params = {
      timestamp,
      nonce,
      ...config.params,
    } as unknown;

    if (config.url) {
      let url = config.url;
      url = removeUrlQueryParams(url, ['timestamp', 'nonce', 'signature']);
      // 原始url 中有 signature 相关的key则移除相关key
      if (config.url !== url) {
        config.url = url;
      }
    }

    // url中有 query 参数
    let queryParams: Record<string, unknown> = {};
    if (config.url) {
      queryParams = getUrlQueryParams(config.url, encodeUriQuery);
    }

    // 删除后台忽略的key
    for (const ignoreKey of options.ignoreParams) {
      if (ignoreKey in queryParams) {
        delete queryParams[ignoreKey];
      }
    }

    // query params in the config's params
    const configQueryParams: Record<string, unknown> = {};
    for (const key in config.params) {
      if (Object.prototype.hasOwnProperty.call(config.params, key)) {
        const element = (config.params as Record<string, unknown>)[key] as string;
        configQueryParams[key] = encodeUriQuery(element);
      }
    }

    let encodedStr = '';
    encodedStr = getSortedParamsStr(
      {
        ...queryParams,
        ...configQueryParams,
      },
      encodeUrlParamToSign,
    ) as string;

    if (isPost && isJsonData && !isFormData && config.data) {
      // application/json 格式的签名需要特殊处理：先按顺序拼接url参数，再直接拼接上encode(JSON.stringify(jsonObj))进行签名。
      // 简化处理，将nonce、timestamp参数加到url中。
      if (isString(config.data)) {
        // body 加密时，body data 就是字符串
        encodedStr += encodeBodyParamToSign(config.data);
      } else if (isNumber(config.data)) {
        // 以防万一有number类型
        encodedStr += config.data + '';
      } else {
        encodedStr += encodeBodyParamToSign(JSON.stringify(config.data));
      }
    }

    let baseURL = '';
    if (config.baseURL) {
      baseURL = config.baseURL;
    }
    const hasSchema = (url: string) => {
      return url.startsWith('http://') || url.startsWith('https://');
    };
    const getPathname = (url: string) => {
      return new URL(url).pathname;
    };
    let urlPath = '';
    if (hasSchema(config.url)) {
      urlPath = getPathname(config.url);
    } else {
      if (hasSchema(baseURL)) {
        baseURL = getPathname(baseURL);
      }
      if (baseURL.endsWith('/') || config.url.startsWith('/')) {
        urlPath = `${baseURL}${config.url?.split('?')[0]}`.replace(/\/+/g, '/');
      } else {
        urlPath = `${baseURL}/${config.url?.split('?')[0]}`.replace(/\/+/g, '/');
      }
    }

    const signSrc = `${urlPath}?${encodedStr}`;
    // console.warn("calculate signature from : ", signSrc);
    const signatureVal = Base64.stringify(HmacSHA1(signSrc, options.ak));
    // 加入参数签名
    config.params = {
      signature: signatureVal,
      ...config.params,
    } as unknown;

    return config;
  }
}
