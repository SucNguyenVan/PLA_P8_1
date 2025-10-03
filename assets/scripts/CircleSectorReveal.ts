// assets/scripts/CircleSectorReveal.ts
import { _decorator, Component, Node, Mask, Graphics, UITransform, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Reveal ảnh tròn từ 0% → 100% bằng quét hình quạt quanh TÂM:
 * - Bắt đầu tại 6h (270°), quét theo chiều kim đồng hồ.
 * - Dùng Mask(GraphicsStencil) INVERTED và vẽ "phần BỊ ẨN" (wedge) 100% → 0%.
 * - Sprite PHẢI là CON của node gắn script này.
 */
@ccclass('CircleSectorReveal')
export class CircleSectorReveal extends Component {
  @property({ type: Node, tooltip: 'Node Sprite ảnh tròn (PHẢI là CON của node mask này)' })
  spriteNode: Node | null = null;

  @property({ tooltip: 'Tự khớp kích thước mask với sprite & neo tâm (anchor = 0.5)' })
  fitToSprite: boolean = true;

  @property({ tooltip: 'Góc bắt đầu (độ). 0°=3h, 90°=12h, 180°=9h, 270°=6h' })
  startAngleDeg: number = 270; // 6h

  @property({ tooltip: 'Quét theo chiều kim đồng hồ (true) hay ngược (false)' })
  clockwise: boolean = true;

  @property({ tooltip: 'Thời gian quét hết 1 vòng (giây)' })
  duration: number = 1.5;

  @property({ tooltip: 'Tự chạy khi bật node' })
  autoStart: boolean = true;

  // runtime
  private _mask: Mask | null = null;
  private _g: Graphics | null = null;
  private _progress = 0; // 0..1 (0 = chưa reveal gì, 1 = reveal 100%)
  private _holder = { p: 0 }; // tween holder
  private _tw: Tween<{ p: number }> | null = null;

  // ===== lifecycle =====
  onLoad() {
    // Mask + Graphics
    this._mask = this.getComponent(Mask) ?? this.addComponent(Mask);
    this._mask.type = Mask.Type.GRAPHICS_STENCIL;
    this._mask.inverted = true; // <<< QUAN TRỌNG: đảo mask để phần ngoài wedge được hiển thị

    this._g = this.getComponent(Graphics) ?? this.addComponent(Graphics);

    // Sprite PHẢI là con để mask có hiệu lực
    if (this.spriteNode && this.spriteNode.parent !== this.node) {
      console.warn('[CircleSectorReveal] spriteNode phải là CON của node mask để Mask có tác dụng.');
    }

    // Căn kích thước & neo tâm (để (0,0) là TÂM vẽ)
    const maskUI = this.getComponent(UITransform) ?? this.addComponent(UITransform);
    const sprUI = this.spriteNode?.getComponent(UITransform) ?? null;

    maskUI.anchorX = maskUI.anchorY = 0.5;
    if (this.fitToSprite && sprUI) {
      sprUI.anchorX = sprUI.anchorY = 0.5;
      maskUI.setContentSize(sprUI.width, sprUI.height);
      this.spriteNode!.setPosition(0, 0, 0);
    }

    this._progress = 0; // bắt đầu 0% reveal
    this._redraw();
  }

//   onEnable() {
//     if (this.autoStart) this.play(this.duration);
//   }

  onDisable() {
    this.stop();
  }

  // ===== public API =====
  /** Đặt tiến độ 0..1 (0 = ẩn toàn bộ, 1 = hiện toàn bộ) rồi vẽ lại */
  public setProgress(p: number) {
    this._progress = Math.max(0, Math.min(1, p));
    this._redraw();
  }

  /** Chạy hiệu ứng 0% → 100% trong `duration` giây */
  public play(duration?: number) {
    if (duration != null) this.duration = duration;
    this.stop();
    this.setProgress(0);

    this._holder.p = 0;
    this._tw = tween(this._holder)
      .to(this.duration, { p: 1 }, {
        onUpdate: (h?: { p: number }) => {
          if (!h) return;
          this._progress = h.p;
          this._redraw();
        }
      })
      .call(() => { this._tw = null; })
      .start();
  }

  /** Dừng hiệu ứng đang chạy */
  public stop() {
    if (this._tw) { this._tw.stop(); this._tw = null; }
  }

  // ===== core drawing =====
  private _redraw() {
    const g = this._g; if (!g) return;
    g.clear();

    const ui = this.getComponent(UITransform); if (!ui) return;
    const R = Math.max(1, Math.min(ui.width, ui.height) * 0.5);

    // Tính wedge BỊ ẨN:
    // visibleSweep = phần đã reveal = progress * 2π
    // hiddenSweep  = phần còn bị che   = (1 - progress) * 2π
    const FULL = Math.PI * 2;
    const visibleSweep = this._progress * FULL;
    const hiddenSweep  = (1 - this._progress) * FULL;

    // start tại 6h (mặc định), hoặc theo startAngleDeg; 0 rad = 3h
    const startBase = (this.startAngleDeg * Math.PI) / 180;

    // Wedge BỊ ẨN phải chạy tiếp từ mép đang “quét”:
    // (clockwise) ẩn từ (start + visible) → (start + FULL)
    // (ccw)       ẩn từ (start - visible) → (start - FULL)
    let a0: number, a1: number;
    if (this.clockwise) {
      a0 = startBase + visibleSweep;
      a1 = a0 + hiddenSweep; // = start + FULL
    } else {
      a1 = startBase - visibleSweep;
      a0 = a1 - hiddenSweep; // = start - FULL
    }

    // Trường hợp biên:
    // - progress = 0  -> hidden = FULL -> vẽ full circle (ẩn 100% -> hiện 0%)
    // - progress ≈ 1 -> hidden ≈ 0    -> không vẽ wedge (stencil rỗng) => inverted = true => hiện 100%
    const EPS = 1e-6;
    if (hiddenSweep >= FULL - EPS) {
      g.circle(0, 0, R); // wedge = full -> ẩn toàn bộ
      g.fill();
      return;
    }
    if (hiddenSweep <= EPS) {
      // không vẽ gì vào stencil -> inverted true => hiện toàn bộ
      return;
    }

    // Vẽ wedge (annular sector đặc từ TÂM) làm vùng BỊ ẨN
    const cos = Math.cos, sin = Math.sin;

    // Đảm bảo a0 <= a1 cho arc thuận chiều (anticlockwise=false)
    if (a1 < a0) { const t = a0; a0 = a1; a1 = t; }

    g.moveTo(0, 0);                        // TÂM
    g.lineTo(R * cos(a0), R * sin(a0));    // bán kính tại a0
    g.arc(0, 0, R, a0, a1, false);         // cung ngoài a0 -> a1
    g.lineTo(0, 0);                        // trở lại TÂM
    g.close();
    g.fill();                              // phần vẽ này là PHẦN BỊ ẨN (do inverted = true)
  }
}
