// assets/scripts/SimpleDownloadOverlay.ts
import {
  _decorator,
  Component,
  Node,
  Button,
  Sprite,
  Color,
  Widget,
  UIOpacity,
  BlockInputEvents,
  UITransform,
  Canvas,
  sys,
} from 'cc';
const { ccclass, property } = _decorator;

// Khai báo MRAID theo mẫu
declare const mraid: {
  open: (url: string) => void;
  close?: () => void;
  expand?: () => void;
  resize?: () => void;
  getState?: () => string;
  isViewable?: () => boolean;
  addEventListener?: (event: string, listener: () => void) => void;
  removeEventListener?: (event: string, listener: () => void) => void;
} | undefined;

@ccclass('SimpleDownloadOverlay')
export class SimpleDownloadOverlay extends Component {
  @property({ type: Node, tooltip: 'Nền xám mờ full màn (Node có Sprite + Widget)' })
  dim: Node | null = null;

  @property({ type: Button, tooltip: 'Nút Download ở giữa' })
  downloadBtn: Button | null = null;

  // --- URL theo nền tảng ---
  downloadUrl: string = 'https://play.google.com/store/apps/details?id=com.cscmobi.cookingmarina';

  androidUrl: string = 'https://play.google.com/store/apps/details?id=com.cscmobi.cookingmarina';

  iosUrl: string = 'https://apps.apple.com/us/app/cooking-marina-cooking-games/id1488429989';

  // --- Cờ theo SDK/quảng cáo ---
  mindworks = false;

  @property({ tooltip: 'Bấm Download xong thì ẩn overlay' })
  autoHideOnClick: boolean = true;

  onLoad() {
    // Chặn click xuyên
    this.node.getComponent(BlockInputEvents) || this.node.addComponent(BlockInputEvents);
    this.dim?.getComponent(BlockInputEvents) || this.dim?.addComponent(BlockInputEvents);

    // Gắn handler cho nút
    this.downloadBtn?.node.off(Button.EventType.CLICK, this.onClickDownload, this);
    this.downloadBtn?.node.on(Button.EventType.CLICK, this.onClickDownload, this);

    // Ép full màn
    this.fitToCanvas();
    this.scheduleOnce(() => this.fitToCanvas(), 0);

    // Ẩn mặc định
    // this.node.active = false;
  }

  onEnable() { this.fitToCanvas(); }

  /** Hiện overlay (có thể truyền fallback URL mới) */
  show(url?: string) {
    if (url) this.downloadUrl = url;
    this.node.active = true;

    // Đưa lên trên cùng
    const p = this.node.parent;
    if (p) this.node.setSiblingIndex(p.children.length - 1);

    this.fitToCanvas();
  }

  /** Ẩn overlay */
  hide() { this.node.active = false; }

  // ===== helpers UI =====
  private fitToCanvas() {
    const canvas = this.node.scene?.getComponentInChildren(Canvas);
    const canvasUT = canvas?.node.getComponent(UITransform)
                   ?? this.node.parent?.getComponent(UITransform);
    if (!canvasUT) return;

    // Overlay full Canvas
    const overlayUT = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    overlayUT.setContentSize(canvasUT.contentSize);
    const overlayW = this.node.getComponent(Widget) ?? this.node.addComponent(Widget);
    overlayW.isAlignTop = overlayW.isAlignBottom = overlayW.isAlignLeft = overlayW.isAlignRight = true;
    overlayW.top = overlayW.bottom = overlayW.left = overlayW.right = 0;
    overlayW.updateAlignment();

    // Dim full Canvas
    if (this.dim) {
      const dimUT = this.dim.getComponent(UITransform) ?? this.dim.addComponent(UITransform);
      dimUT.setContentSize(canvasUT.contentSize);
      this.dim.setPosition(0, 0, 0);

      const dimW = this.dim.getComponent(Widget) ?? this.dim.addComponent(Widget);
      dimW.isAlignTop = dimW.isAlignBottom = dimW.isAlignLeft = dimW.isAlignRight = true;
      dimW.top = dimW.bottom = dimW.left = dimW.right = 0;
      dimW.updateAlignment();

      const sp = this.dim.getComponent(Sprite) ?? this.dim.addComponent(Sprite);
      if (!sp.spriteFrame) {
        console.warn('[SimpleDownloadOverlay] Dim chưa có SpriteFrame. Hãy gán 1 sprite trắng 1×1.');
      }
      sp.color = new Color(0, 0, 0, 180); // xám mờ nhìn xuyên
      this.dim.getComponent(UIOpacity) ?? this.dim.addComponent(UIOpacity);
    }

    // Đặt nút giữa màn
    // if (this.downloadBtn) this.downloadBtn.node.setPosition(0, 0, 0);
  }

  // ====== LOGIC DOWNLOAD (áp dụng đúng mẫu của bạn) ======
  /** Chọn link theo nền tảng, có fallback. */
  private resolveLink(): string {
    if (sys.os === sys.OS.ANDROID && this.androidUrl) return this.androidUrl;
    if (sys.os === sys.OS.IOS && this.iosUrl) return this.iosUrl;
    return this.downloadUrl || this.androidUrl || this.iosUrl || '';
  }

  /** onDownloadAction theo mẫu của bạn (mặc định MRAID → window.open). */
  private onDownloadAction() {
    const link = this.resolveLink();
    console.log({link})
    if (!link) return;

    if (typeof mraid !== 'undefined' && mraid && typeof mraid.open === 'function') {
      mraid.open(link);
    } else {
      (globalThis as any).open ? (globalThis as any).open(link) : sys.openURL(link);
    }
  }

  /** onDownload theo mẫu của bạn: Mindworks → dapi (ironSource) → mặc định. */
  private doDownload() {
    const w: any = globalThis as any;
    const myWindow = window as any
    if (this.mindworks) {
      myWindow?.install && myWindow.install();
      myWindow?.gameEnd && myWindow.gameEnd();
      return;
    }

    if (w?.dapi?.openStoreUrl) {
      // ironSource: theo mẫu của bạn, không truyền URL
      w.dapi.openStoreUrl();
      return;
    }

    // Unity/Applovin/khác → dùng onDownloadAction
    this.onDownloadAction();
  }

  private onClickDownload = () => {
    console.log("download")
    this.doDownload();
    if (this.autoHideOnClick) this.hide();
    this.node.emit('overlay:download_clicked', this.resolveLink());
  };
}
