// assets/scripts/SfxInit.ts
import { _decorator, Component, AudioClip } from 'cc';
import * as Sfx from './Sfx';
const { ccclass, property } = _decorator;

@ccclass('SfxInit')
export class SfxInit extends Component {
  @property({ type: AudioClip, tooltip: 'Clip SFX dùng chung' })
  sfx: AudioClip | null = null;

  @property({ tooltip: 'Volume mặc định 0..1', min: 0, max: 1, slide: true })
  volume: number = 1.0;

  onLoad() {
    if (this.sfx) {
      Sfx.setClip(this.sfx);
      Sfx.setDefaultVolume(this.volume);
    } else {
      console.warn('[SfxInit] Chưa gán clip SFX.');
    }
  }
}
