// assets/scripts/CircleArcReveal.ts
import { _decorator, Component, Node, Mask, Graphics, UITransform, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

export enum ArcMode {
  Accumulate = 0, // vẽ tích lũy từ 12h → góc hiện tại
  Scanner = 1,    // chỉ 1 lát mỏng chạy vòng quanh (không tích lũy)
}

/**
 * Hiệu ứng vành tròn chạy quanh TÂM:
 * - Node gắn script này là MASK (GRAPHICS_STENCIL).
 * - Sprite hình tròn PHẢI là CON của node này để bị mask.
 */
@ccclass('CircleArcReveal')
export class CircleArcReveal extends Component {
  @property({ type: Node, tooltip: 'Node Sprite (phải là CON của node mask này)' })
  spriteNode: Node | null = null;

  @property({ tooltip: 'Tự khớp kích thước mask với sprite & neo tâm' })
  fitToSprite: boolean = true;

  @property({ tooltip: 'Độ dày vành (px, tính từ ngoài vào trong)' })
  ringThickness: number = 12;

  @property({ tooltip: 'Chế độ hiển thị: Accumulate / Scanner' })
  mode: ArcMode = ArcMode.Accumulate;

  @property({ tooltip: 'Bề rộng lát khi dùng Scanner (độ, 0..360)' })
  scannerWidthDeg: number = 24;

  @property({ tooltip: 'Quét theo chiều kim đồng hồ (12h → 3h → 6h …)' })
  clockwise: boolean = true;

  @property({ tooltip: 'Thời gian chạy hết 1 vòng (giây) khi gọi play()' })
  duration: number = 2.0;

  @property({ tooltip: 'Tự chạy khi bật node' })
  autoStart: boolean = true;

  @property({ tooltip: 'Bật log debug' })
  debugLogs: boolean = false;

  // runtime
  private _mask: Mask | null = null;
  private _g: Graphics | null = null;
  private _progress = 0;                 // 0..1
  private _tw: Tween<{ p: number }> | null = null; // tween cho holder
  private _holder = { p: 0 };            // object trung gian cho tween

  // ===== lifecycle =====
  onLoad() {
    // Bảo đảm có Mask + Graphics
    this._mask = this.getComponent(Mask) ?? this.addComponent(Mask);
    this._mask.type = Mask.Type.GRAPHICS_STENCIL;

    this._g = this.getComponent(Graphics) ?? this.addComponent(Graphics);

    // Bắt buộc sprite là con để mask ăn
    if (this.spriteNode && this.spriteNode.parent !== this.node) {
      console.warn('[CircleArcReveal] spriteNode phải là CON của node mask để Mask có tác dụng.');
    }

    // Căn kích thước & tâm
    const maskUI = this.getComponent(UITransform) ?? this.addComponent(UITransform);
    const sprUI = this.spriteNode?.getComponent(UITransform) ?? null;

    if (this.fitToSprite && sprUI) {
      maskUI.anchorX = maskUI.anchorY = 0.5;
      sprUI.anchorX = sprUI.anchorY = 0.5;
      maskUI.setContentSize(sprUI.width, sprUI.height);
      this.spriteNode!.setPosition(0, 0, 0);
    } else {
      maskUI.anchorX = maskUI.anchorY = 0.5;
    }

    this._progress = 0;
    this._redraw();
  }

  onEnable() {
    if (this.autoStart) this.play(this.duration);
  }

  onDisable() {
    this.stop();
  }

  /** Đặt tiến độ 0..1 (0=chưa vẽ, 1=đủ vòng) rồi vẽ lại */
  public setProgress(p: number) {
    this._progress = Math.max(0, Math.min(1, p));
    this._redraw();
  }

  /** Chạy animation vẽ hết 1 vòng trong `duration` giây */
  public play(duration?: number) {
    if (duration != null) this.duration = duration;
    this.stop();
    this.setProgress(0);

    this._holder.p = 0;
    this._tw = tween(this._holder)
      .to(this.duration, { p: 1 }, {
        onUpdate: (target?: { p: number }) => {
          if (!target) return;
          this._progress = target.p;
          this._redraw();
        }
      })
      .call(() => { this._tw = null; })
      .start();
  }

  /** Dừng animation đang chạy */
  public stop() {
    if (this._tw) {
      this._tw.stop();
      this._tw = null;
    }
  }

  // ================= core drawing =================
  private _redraw() {
    const g = this._g;
    if (!g) return;
    g.clear();

    const ui = this.getComponent(UITransform);
    if (!ui) return;

    // BÁN KÍNH tính theo node mask (đã fit với Sprite nếu bật fitToSprite)
    const R = Math.max(1, Math.min(ui.width, ui.height) * 0.5);
    const t = Math.max(1, Math.min(this.ringThickness, R));
    const r = Math.max(0.0001, R - t); // bán kính trong

    // 12h = -90° = -PI/2
    const startBase = -Math.PI / 2;
    const full = Math.PI * 2;
    const sweep = this._progress * full;
    const ang = this.clockwise ? startBase + sweep : startBase - sweep;

    if (this.mode === ArcMode.Accumulate) {
      // Vẽ vành từ startBase → ang (tích lũy)
      this._drawAnnularSector(g, R, r, startBase, ang);
    } else {
      // Scanner: chỉ một lát mỏng quanh "ang"
      const half = (Math.max(0, Math.min(360, this.scannerWidthDeg)) * Math.PI / 180) * 0.5;
      const a0 = ang - half;
      const a1 = ang + half;
      this._drawAnnularSector(g, R, r, a0, a1);
    }

    if (this.debugLogs) {
      // console.log(`[Arc] progress=${this._progress.toFixed(3)} R=${R.toFixed(1)} r=${r.toFixed(1)}`);
    }
  }

  /**
   * Vẽ một miếng "vành" (annular sector) bởi 2 góc [a0, a1] (rad).
   * Không phụ thuộc chiều; sẽ tự sắp xếp a0 <= a1.
   */
  private _drawAnnularSector(g: Graphics, R: number, r: number, a0: number, a1: number) {
    if (a1 < a0) { const tmp = a0; a0 = a1; a1 = tmp; }

    const cos = Math.cos, sin = Math.sin;

    g.moveTo(R * cos(a0), R * sin(a0));          // điểm đầu ngoài
    g.arc(0, 0, R, a0, a1, false);               // outer arc a0 -> a1
    g.lineTo(r * cos(a1), r * sin(a1));          // nối vào trong
    g.arc(0, 0, r, a1, a0, true);                // inner arc a1 -> a0 (ngược)
    g.close();
    g.fill();                                    // fill để Mask stencil lấy vùng này
  }
}
