import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("MintegralRequried")
export class MintegralRequried extends Component {
  mindworks = true;
  vungle = false;
  start() {
    if (this.mindworks) {
      (window as any)?.gameReady && (window as any)?.gameReady();
    }
  }

  EventNetWork() {
    if (this.mindworks) {
      (window as any)?.gameEnd && (window as any)?.gameEnd();
    }
    if (this.vungle) {
      (parent as any).postMessage("complete", "*");
    }
  }
}
