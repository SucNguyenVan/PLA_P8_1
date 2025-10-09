// assets/scripts/HandTapPressLoop.ts
import { _decorator, Component, Node, Vec3, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

/** Hiệu ứng tay "tap" nút: xuống rồi lên, nghỉ một nhịp, lặp. */
@ccclass('HandTapPressLoop')
export class HandTapPressLoop extends Component {
  @property({ tooltip: 'Khoảng dịch khi nhấn (px, hướng Y-)' })
  distance = 18;

  @property({ tooltip: 'Thời gian đi xuống (s)' })
  downDuration = 0.08;

  @property({ tooltip: 'Thời gian nhả lên (s)' })
  upDuration = 0.10;

  @property({ tooltip: 'Dừng giữa hai lần tap (s)' })
  pause = 0.35;

  @property({ tooltip: 'Tự chạy khi node bật' })
  autoStart = true;

  private _origin = new Vec3();
  private _loop?: Tween<Node>;

  onEnable() {
    this.node.getPosition(this._origin); // nhớ vị trí tay do bạn đặt sẵn
    if (this.autoStart) this.play();
  }

  onDisable() { this.stop(); }

  /** Bắt đầu lặp: xuống → lên → pause → lặp */
  public play() {
    this.stop();

    const pressed = new Vec3(this._origin.x, this._origin.y - this.distance, this._origin.z);

    this._loop = tween(this.node)
      .to(this.downDuration, { position: pressed }, { easing: 'quadOut' }) // nhấn xuống
      .to(this.upDuration,   { position: this._origin }, { easing: 'quadIn' }) // nhả lên
      .delay(this.pause) // nghỉ
      .union()
      .repeatForever()
      .start() as Tween<Node>;
  }

  /** Tap một lần (không lặp) rồi dừng, trả tay về gốc. */
  public tapOnce(onDone?: () => void) {
    this.stop();

    const pressed = new Vec3(this._origin.x, this._origin.y - this.distance, this._origin.z);

    tween(this.node)
      .to(this.downDuration, { position: pressed }, { easing: 'quadOut' })
      .to(this.upDuration,   { position: this._origin }, { easing: 'quadIn' })
      .call(() => onDone?.())
      .start();
  }

  /** Dừng hiệu ứng & trả tay về vị trí gốc. */
  public stop() {
    this._loop?.stop();
    this._loop = undefined;
    this.node.setPosition(this._origin);
  }
}
