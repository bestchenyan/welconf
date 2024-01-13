import { debounce } from 'lodash-es';

interface ScreenOpts {
  width?: number;
  height?: number;
  backgroundColor?: string;
  overflow?: string;
  background?: string;
  isDrawerMask?: boolean;
  zoom?: 'full' | 'width' | 'height' | 'auto' | 'none';
  app?: string;
}
export default class Screen {
  w!: number | undefined;
  h!: number | undefined;
  backgroundColor?: string;
  overflow?: string;
  background?: string;
  isDrawerMask?: boolean;
  zoom: 'full' | 'width' | 'height' | 'auto' | 'none' = 'full';
  clientWidth!: number;
  clientHeight!: number;
  app!: string;

  public constructor(options?: ScreenOpts) {
    this.app = options?.app ?? '#root';
    this.reInit(options);
  }

  getBaseWidth() {
    let width = 1920;
    if (screen.width > 2560 && window.innerWidth > 1920) width = window.innerWidth;
    return width;
  }

  getBaseHeight() {
    let height = 1080;
    if (screen.width > 3840 && window.innerHeight > 1080) height = window.innerWidth;
    return height;
  }

  get width() {
    return this.w ?? this.getBaseWidth();
  }

  get height() {
    return this.h ?? this.getBaseHeight();
  }

  reInit(options?: ScreenOpts) {
    this.w = options?.width;
    this.h = options?.height;
    this.backgroundColor = options?.backgroundColor ?? '';
    this.overflow = options?.overflow;
    this.background = options?.background;
    this.isDrawerMask = options?.isDrawerMask ?? true;
    this.zoom = options?.zoom ?? 'full';
    this.init();
  }

  public getTransform(
    zoom: 'full' | 'width' | 'height' | 'auto' | 'none' = 'full',
    isNeed = false,
  ) {
    const scaleX = Number((this.clientWidth / this.width).toFixed(6));
    const scaleY = Number((this.clientHeight / this.height).toFixed(6));

    let screenType;
    switch (zoom) {
      case 'full': {
        const hRadio = this.height / this.clientHeight;
        const newClientWidth = this.width / hRadio;
        screenType = this.clientWidth < newClientWidth ? 1 : 2;
        break;
      }
      case 'width': {
        screenType = 2;
        break;
      }
      case 'height': {
        screenType = 1;
        break;
      }
      case 'auto': {
        screenType = 3;
        break;
      }
    }

    let transform = 'none';
    let width, height, overflow;
    if (isNeed) {
      //   window.screenScale = 1;
      //   window.screenScaleY = 1;
    }
    // window.pw = this.width;
    // window.ph = this.height;
    switch (screenType) {
      case 1:
        transform = `translateZ(0) scale(${scaleY})`;
        width = `${Math.ceil(this.clientWidth / scaleY)}px`;
        height = `${Math.ceil(this.clientHeight / scaleY)}px`;
        overflow = 'overflow-y: hidden; overflow-x: auto';
        if (isNeed) {
          //   window.screenScale = scaleY;
          //   window.screenScaleY = scaleY;
        }
        break;
      case 2:
        transform = `translateZ(0) scale(${scaleX})`;
        width = `${Math.ceil(this.clientWidth / scaleX)}px`;
        height = `${Math.ceil(this.clientHeight / scaleX)}px`;
        overflow = 'overflow-y: auto; overflow-x: hidden';
        if (isNeed) {
          //   window.screenScale = scaleX;
          //   window.screenScaleY = scaleX;
        }
        break;
      case 3:
        transform = `translateZ(0) scale(${scaleX}, ${scaleY})`;
        width = `${this.width}px`;
        height = `${this.height}px`;
        overflow = 'overflow-y: hidden; overflow-x: hidden';
        if (isNeed) {
          //   window.screenScale = scaleX;
          //   window.screenScaleY = scaleY;
        }
        break;
    }

    return { transform, width, height, screenType, overflow };
  }

  protected resize() {
    const id = 'screen-resize-hzl';
    let style = document.querySelector(`#${id}`);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
    }
    const { transform, width, height, screenType, overflow } = this.getTransform(this.zoom, true);
    const backgroundColor = this.backgroundColor
      ? `background-color: ${this.backgroundColor};`
      : '';
    const background = this.background ? `background: ${this.background};` : '';
    const cssTexts = `width: ${width}; height: ${height}; transform-origin: 0 0; transform: ${transform}; ${background} ${backgroundColor}; background-repeat: no-repeat; background-size: cover;`;
    let innerHTML = `${this.app}{${cssTexts}}`;
    let pageCssTexts;
    if (screenType === 1 && parseInt(width!) < this.width - 200)
      pageCssTexts = `width: ${this.width}px`;

    if (pageCssTexts) innerHTML += `${this.app} .app > .page{${pageCssTexts}}`;
    if (this.overflow) innerHTML += `${this.app} ${this.overflow}{${overflow}}`;
    style.innerHTML = innerHTML;
    document.body.appendChild(style);
  }

  protected resizeAll() {
    this.clientWidth = document.documentElement.clientWidth;
    this.clientHeight = document.documentElement.clientHeight;
    this.resize();
  }

  protected handleResizeEvent = debounce(() => {
    this.clientWidth = document.documentElement.clientWidth;
    this.clientHeight = document.documentElement.clientHeight;
    this.resize();
  }, 30).bind(this);

  protected remove() {
    window.removeEventListener('resize', this.handleResizeEvent, false);
  }

  protected init() {
    window.addEventListener('resize', this.handleResizeEvent, false);
    this.resizeAll();
  }
}
