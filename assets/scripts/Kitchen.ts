import { _decorator, Component, Node, EventTouch } from "cc";
import { BreadOven } from "./BreadOven";
import { KitchenBread } from "./KitchenBread";
import * as Sfx from "./Sfx";
const { ccclass, property } = _decorator;

@ccclass("Kitchen")
export class Kitchen extends Component {
  // @property({
  //   type: Node,
  //   tooltip: "node cho bread",
  // })
  // breadOven1: Node;

  // @property({
  //   type: Node,
  //   tooltip: "node cho bread",
  // })
  // breadOven2: Node;

  // @property({
  //   type: Node,
  //   tooltip: "node cho bread",
  // })
  // breadOven3: Node;

  // @property({
  //   type: Node,
  //   tooltip: "node cho bread",
  // })
  // breadOven4: Node;

  @property({
    type: [Node],
    tooltip: "Kéo các lò nướng vào đây theo thứ tự ưu tiên",
  })
  breadOvens: Node[] = [];

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

  isPressedFirstBread = false;
  onEnable() {
    this.initBreadFood();
  }

  update(deltaTime: number) {}

  initBreadFood() {
    this.breadFood?.on(Node.EventType.TOUCH_START, this.spawnBread, this);
  }

  // spawnBread() {
  //   const breadOven1Controller = this.breadOven1.getComponent(BreadOven);
  //   const isCookingBread1 = breadOven1Controller?.getIsCookingBread();
  //   if (!isCookingBread1) {
  //     breadOven1Controller.spawnBread();
  //     Sfx.play();
  //   } else {
  //     const breadOven2Controller = this.breadOven2.getComponent(BreadOven);
  //     const isCookingBread2 = breadOven2Controller?.getIsCookingBread();
  //     if (!isCookingBread2) {
  //       breadOven2Controller?.spawnBread();
  //       Sfx.play();
  //     }
  //   }
  //   if (!this.isPressedFirstBread) {
  //     const kitchenBreadScript = this.breadFood.getComponent(KitchenBread);
  //     if (kitchenBreadScript) {
  //       kitchenBreadScript.handNode.active = false;
  //       this.isPressedFirstBread = true;
  //     }
  //   }
  // }
  spawnBread() {
    const ovens = this.breadOvens;
    let spawned = false;

    for (const oven of ovens) {
      const ctrl = oven?.getComponent(BreadOven);
      if (ctrl && !ctrl.getIsCookingBread()) {
        ctrl.spawnBread();
        Sfx.play();
        spawned = true;
        break;
      }
    }

    if (spawned && !this.isPressedFirstBread) {
      const kitchenBreadScript = this.breadFood.getComponent(KitchenBread);
      if (kitchenBreadScript) {
        kitchenBreadScript.handNode.active = false;
        this.isPressedFirstBread = true;
      }
    }
  }
}
