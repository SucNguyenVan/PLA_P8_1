// assets/scripts/BgmPlayer.ts
import {
  _decorator, Component, AudioSource, AudioClip,
  game, Game, sys, input, Input
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BgmPlayer')
export class BgmPlayer extends Component {
  @property(AudioClip) bgm: AudioClip | null = null;
  @property({ tooltip: 'Âm lượng 0..1' }) volume = 0.6;
  @property({ tooltip: 'Lặp lại' }) loop = true;

  private src!: AudioSource;
  private unlocked = false;

  onLoad() {
    this.src = this.getComponent(AudioSource) || this.node.addComponent(AudioSource);
    if (this.bgm) this.src.clip = this.bgm;
    this.src.loop = this.loop;
    this.src.volume = this.volume;

    // Giữ nhạc khi đổi scene
    game.addPersistRootNode(this.node);

    // Tự tạm dừng/tiếp tục khi app ẩn/hiện
    game.on(Game.EVENT_HIDE, () => this.src.pause(), this);
    game.on(Game.EVENT_SHOW, () => this.playSafe(), this);
  }

  start() {
    this.playSafe(); // cố gắng phát ngay khi vào game
  }

  private playSafe() {
    try {
      this.src.play();
      this.unlocked = true;
    } catch (e) {
      // Trình duyệt chặn autoplay: chờ 1 thao tác rồi phát
      if (sys.isBrowser && !this.unlocked) {
        const unlock = () => {
          this.src.play();
          this.unlocked = true;
          input.off(Input.EventType.TOUCH_START, unlock, this);
          window.removeEventListener?.('keydown', unlock);
          window.removeEventListener?.('mousedown', unlock);
        };
        input.on(Input.EventType.TOUCH_START, unlock, this);
        window.addEventListener?.('keydown', unlock, { once: true });
        window.addEventListener?.('mousedown', unlock, { once: true });
      }
    }
  }

  // tiện ích
  setVolume(v: number) { this.src.volume = Math.max(0, Math.min(1, v)); }
//   mute(on: boolean) { this.src.mute = on; }
}
