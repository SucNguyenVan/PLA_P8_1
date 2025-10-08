// assets/scripts/PlaySfxOnClick.ts
import { _decorator, Component, AudioSource, AudioClip, Button, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlaySfxOnClick')
export class PlaySfxOnClick extends Component {
  @property({ type: AudioClip, tooltip: 'Âm thanh SFX sẽ phát khi bấm' })
  sfx: AudioClip | null = null;

  @property({ tooltip: 'Âm lượng 0..1' })
  volume: number = 1.0;

  @property({ tooltip: 'Chặn spam click (ms)' })
  cooldownMs: number = 80;

  private _audio!: AudioSource;
  private _last = 0;

  onLoad() {
    // Đảm bảo có AudioSource trên cùng node
    this._audio = this.getComponent(AudioSource) ?? this.addComponent(AudioSource);
    this._audio.playOnAwake = false;
    this._audio.loop = false;
  }

  onEnable() {
    // Nếu là Button thì nghe sự kiện CLICK; fallback sang TOUCH_END nếu không có Button
    const btn = this.getComponent(Button);
    if (btn) this.node.on(Button.EventType.CLICK, this._onClick, this);
    else this.node.on(Node.EventType.TOUCH_END, this._onClick, this);
  }

  onDisable() {
    const btn = this.getComponent(Button);
    if (btn) this.node.off(Button.EventType.CLICK, this._onClick, this);
    else this.node.off(Node.EventType.TOUCH_END, this._onClick, this);
  }

  private _onClick() {
    if (!this.sfx) return;
    const now = Date.now();
    if (now - this._last < this.cooldownMs) return;
    this._last = now;
    // Phát một lần, không ảnh hưởng clip hiện tại của AudioSource
    this._audio.playOneShot(this.sfx, this.volume);
  }
}
