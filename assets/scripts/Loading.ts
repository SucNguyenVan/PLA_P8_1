import { _decorator, Component, Node } from "cc";
import { CircleSectorReveal } from "./CircleSectorReveal";

const { ccclass, property } = _decorator;

@ccclass("Loading")
export class Loading extends Component {
  @property({
    type: Node,
    tooltip: "",
  })
  baseBg: Node;
  @property({
    type: Node,
    tooltip: "",
  })
  bg: Node;
  @property({
    type: Node,
    tooltip: "",
  })
  loading: Node;
  @property({
    type: Node,
    tooltip: "",
  })
  loadingFull: Node;
  @property({
    type: Node,
    tooltip: "",
  })
  clock: Node;
  start() {
    this.node.active = false;
    this.loadingFull.active = false;
  }

  update(deltaTime: number) {}

  playLoading(durationTime: number) {
    this.node.active = true;
    this.loadingFull.active = false;
    const loadingScript = this.loading.getComponent(CircleSectorReveal);
    if (loadingScript) {
      loadingScript.play(durationTime);
      this.scheduleOnce(() => {
        this.loadingFull.active = true;
        this.hiddenLoading()
      }, durationTime);
    }
  }

  hiddenLoading() {
    this.loadingFull.active = false;
    this.node.active = false;
  }
}
