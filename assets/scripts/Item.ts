import { _decorator, Component, Enum, Node } from "cc";
import { PlateType, PlateTypeEnum } from "./Enum";
const { ccclass, property } = _decorator;

@ccclass("Item")
export class Item extends Component {
  @property({
    type: PlateTypeEnum,
    tooltip: "loại thức ăn",
  })
  itemType: PlateType;

  isChecked = false;

  @property({
    type: Node,
    tooltip: "",
  })
  checkNode: Node;
  start() {
    this.checkNode.active = false;
  }

  update(deltaTime: number) {}

  checkItem() {
    this.isChecked = true;
    this.checkNode.active = true;
  }
}
