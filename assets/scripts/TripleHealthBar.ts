// assets/scripts/TripleHealthBar.ts
import { _decorator, Component, Node, UITransform, math } from "cc";
const { ccclass, property } = _decorator;

@ccclass("TripleHealthBar")
export class TripleHealthBar extends Component {
  @property({ type: Node, tooltip: "Thanh màu xanh (trên cùng)" })
  green!: Node;

  @property({ type: Node, tooltip: "Thanh màu vàng (giữa)" })
  yellow!: Node;

  @property({ type: Node, tooltip: "Thanh màu đỏ (dưới cùng)" })
  red!: Node;

  @property({ tooltip: "Tổng thời gian (giây) mặc định" })
  totalSeconds: number = 10;

  @property({ tooltip: "Ngưỡng cảnh báo (ẩn xanh). 0.5 = 50%" })
  warnThreshold: number = 0.5;

  @property({ tooltip: "Ngưỡng nguy hiểm (ẩn vàng). 0.2 = 20%" })
  dangerThreshold: number = 0.2;

  private _baseHeight = 0;
  private _timeLeft = 0;
  private _running = false;
  private _finished = false;
  private _onFinished: (() => void) | null = null;

  onLoad() {
    // Ép 3 thanh về anchorY = 0 và giữ nguyên đáy
    this._ensureAnchorBottom(this.red);
    this._ensureAnchorBottom(this.yellow);
    this._ensureAnchorBottom(this.green);

    // Lấy chiều cao gốc từ thanh đỏ (3 thanh nên cùng size)
    const redTf = this.red.getComponent(UITransform);
    if (!redTf) throw new Error("[TripleHealthBar] Red node thiếu UITransform");
    this._baseHeight = redTf.height;

    // đảm bảo green nằm trên cùng
    if (this.green.parent) {
      this.green.setSiblingIndex(this.green.parent.children.length - 1);
    }

    // Khởi tạo UI full nhưng KHÔNG tự chạy
    this._timeLeft = this.totalSeconds;
    this._applyVisual();
  }

  update(dt: number) {
    if (!this._running) return;

    this._timeLeft -= dt;
    if (this._timeLeft <= 0) {
      this._timeLeft = 0;
      this._running = false;
      if (!this._finished) {
        this._finished = true;
        this._applyVisual();
        this._onFinished?.();
      }
      return;
    }
    this._applyVisual();
  }

  // --- API ---
  /** Bắt đầu đếm ngược. Có thể truyền totalSeconds mới và/hoặc callback hết giờ. */
  public startCountdown(total?: number, onFinished?: () => void) {
    if (typeof total === "number") this.totalSeconds = Math.max(0.0001, total);
    if (onFinished) this._onFinished = onFinished;

    this._timeLeft = this.totalSeconds;
    this._running = true;
    this._finished = false;
    this._applyVisual();
  }

  /** Đặt callback hết giờ (nếu không muốn truyền trong startCountdown). */
  public setOnFinished(cb: (() => void) | null) {
    this._onFinished = cb;
  }

  public pause() { this._running = false; }
  public resume() { if (this._timeLeft > 0) this._running = true; }

  /** Đặt thời gian còn lại (giây) thủ công, KHÔNG tự chạy. */
  public setTimeLeft(seconds: number) {
    this._timeLeft = math.clamp(seconds, 0, this.totalSeconds);
    this._finished = this._timeLeft <= 0;
    this._applyVisual();
  }

  /** Reset về full, KHÔNG tự chạy. */
  public reset() {
    this._timeLeft = this.totalSeconds;
    this._running = false;
    this._finished = false;
    this._applyVisual();
  }

  public get ratio(): number {
    if (this.totalSeconds <= 0) return 0;
    return math.clamp01(this._timeLeft / this.totalSeconds);
  }

  // --- visuals ---
  private _applyVisual() {
    const r = this.ratio;

    // Cập nhật chiều cao: anchorY = 0 nên đáy giữ nguyên, co từ trên xuống
    this._setHeight(this.green, r);
    this._setHeight(this.yellow, r);
    this._setHeight(this.red, r);

    // Ẩn/lộ theo ngưỡng
    if (r >= this.warnThreshold) {
      this.green.active = true;  this.yellow.active = false; this.red.active = false;
    } else if (r >= this.dangerThreshold) {
      this.green.active = false; this.yellow.active = true;  this.red.active = false;
    } else {
      this.green.active = false; this.yellow.active = false; this.red.active = true;
    }
  }

  private _setHeight(n: Node, ratio: number) {
    const tf = n.getComponent(UITransform);
    if (!tf) return;
    const h = Math.max(0, this._baseHeight * ratio);
    tf.setContentSize(tf.width, h);
    // anchorY=0 nên không cần bù vị trí: đáy cố định, đỉnh hạ xuống khi h giảm.
  }

  /** Đổi anchorY về 0 nhưng vẫn giữ nguyên đáy hiện tại (không lệch). */
  private _ensureAnchorBottom(n: Node) {
    const tf = n.getComponent(UITransform);
    if (!tf) return;
    if (tf.anchorY === 0) return;

    // tính y đáy hiện tại theo local: bottom = y - anchorY*height
    const pos = n.position;
    const bottom = pos.y - tf.anchorY * tf.height;

    tf.setAnchorPoint(tf.anchorX, 0);
    n.setPosition(pos.x, bottom, pos.z);
  }
}
