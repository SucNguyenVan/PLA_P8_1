import { _decorator, Component, Node } from "cc";
import { BreadOven, FoodStatus } from "./BreadOven";
const { ccclass, property } = _decorator;

@ccclass("ScanBreadOvens")
export class ScanBreadOvens extends Component {
  @property({
    type: [BreadOven],
    tooltip: "",
  })
  breadOvensArr: BreadOven[] = [];
  start() {}

  update(deltaTime: number) {}

  scanBreadOvens() {
    let result = false;
    for (let breadOven of this.breadOvensArr) {
      if (breadOven.handNode.active) {
        result = true;
        break;
      }
      if (breadOven._status !== FoodStatus.Idle) {
        breadOven.handNode.active = true;
        result = true;
        break;
      }
    }
    console.log({result2: result})
    return result;
  }

  scanOffBreadOvens() {
    for (let breadOven of this.breadOvensArr) {
      breadOven.handNode.active = false
    }
  }
}
