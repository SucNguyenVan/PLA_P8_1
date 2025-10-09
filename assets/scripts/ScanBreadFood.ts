import { _decorator, Component, Node } from "cc";
import { KitchenBread } from "./KitchenBread";
const { ccclass, property } = _decorator;

@ccclass("ScanBreadFood")
export class ScanBreadFood extends Component {
  @property({
    type: KitchenBread,
    tooltip: "node cho bread",
  })
  breadFoodScript: KitchenBread;
  start() {}

  update(deltaTime: number) {}

  scanBreadFood() {
    console.log("scan", this.breadFoodScript.handNode.active)
    if (!this.breadFoodScript.handNode.active) {
      this.breadFoodScript.handNode.active = true;
    }
  }
}
