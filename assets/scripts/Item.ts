import { _decorator, Component, Enum, Node } from "cc";
import { PlateType } from "./Plate";
const { ccclass, property } = _decorator;

@ccclass("Item")
export class Item extends Component {
  @property({
    type: Enum(PlateType),
    tooltip: "loại thức ăn",
  })
  itemType: PlateType;

  isChecked = false

  @property({
    type: Node,
    tooltip: "",
  })
  checkNode: Node;
  start() {
    this.checkNode.active = false;
  }

  update(deltaTime: number) {}

  checkItem(){
    this.isChecked = true
    this.checkNode.active = true
  }
}
