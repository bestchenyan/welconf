// 请求接口数据
export interface ResponseData<T = any> {
  /**
   * 错误标记
   * @type { boolean }
   */
  hasError: boolean;

  /**
   * 数据
   * @type { T }
   */
  result: T;

  /**
   * 消息
   * @type { string }
   */
  message: string;
}
