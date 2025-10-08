// assets/scripts/Sfx.ts
import { AudioClip, AudioSource, Node, game } from 'cc';

let _node: Node | null = null;
let _src: AudioSource | null = null;
let _clip: AudioClip | null = null;
let _defaultVolume = 1.0;

function ensure(): AudioSource {
  if (_src) return _src;
  _node = new Node('SfxPlayer');
  _src = _node.addComponent(AudioSource);
  _src.playOnAwake = false;
  _src.loop = false;
  game.addPersistRootNode(_node); // sống xuyên scene
  return _src;
}

/** Gán clip SFX dùng chung (gọi 1 lần ở scene khởi đầu) */
export function setClip(clip: AudioClip) {
  _clip = clip;
  ensure();
}

/** (tuỳ chọn) set volume mặc định 0..1 */
export function setDefaultVolume(v: number) {
  _defaultVolume = Math.min(1, Math.max(0, v));
}

/** ===== HÀM DUY NHẤT CẦN GỌI: phát SFX ===== */
export function play(volume?: number) {
  if (!_clip) {
    console.warn('[Sfx] Chưa set clip. Gọi Sfx.setClip(...) trước nhé.');
    return;
  }
  const src = ensure();
  src.playOneShot(_clip, volume ?? _defaultVolume);
}
