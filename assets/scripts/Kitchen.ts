import { _decorator, Component, Node, EventTouch } from "cc";
import { BreadOven } from "./BreadOven";
const { ccclass, property } = _decorator;

@ccclass("Kitchen")
export class Kitchen extends Component {
  @property({
    type: Node,
    tooltip: "node cho bread",
  })
  breadOven1: Node;
  @property({
    type: Node,
    tooltip: "node cho bread",
  })
  breadOven2: Node;
  @property({
    type: Node,
    tooltip: "node cho coffee maker",
  })
  coffeeMaker: Node;
  @property({
    type: Node,
    tooltip: "node cho khay đựng bread",
  })
  breadFood: Node;
  onEnable() {
    this.initBreadFood();
  }

  update(deltaTime: number) {}

  initBreadFood() {
    this.breadFood?.on(Node.EventType.TOUCH_START, this.spawnBread, this);
  }

  spawnBread() {
    const breadOven1Controller = this.breadOven1.getComponent(BreadOven);
    const isCookingBread1 = breadOven1Controller?.getIsCookingBread();
    if (!isCookingBread1) {
      breadOven1Controller.spawnBread();
    } else {
      const breadOven2Controller = this.breadOven2.getComponent(BreadOven);
      const isCookingBread2 = breadOven2Controller?.getIsCookingBread();
      if (!isCookingBread2) {
        breadOven2Controller?.spawnBread();
      }
    }
  }
}
