import { _decorator, Component, Node } from "cc";
import { Item } from "./Item";
import { PlateType } from "./Enum";

const { ccclass, property } = _decorator;

@ccclass("ItemsController")
export class ItemsController extends Component {
  @property({
    type: [Item],
    tooltip: "",
  })
  itemsArr: Item[] = [];

  @property({
    type: Node,
    tooltip: "",
  })
  checkNode: Node;

  start() {
    this.checkNode.active = false;
  }

  update(deltaTime: number) {}

  fillItemAction(plateType: PlateType) {
    let result = {
      isFilled: false,
      isCompleteAllItems: false,
    };
    for (let item of this.itemsArr) {
      if (!item.isChecked && item.itemType === plateType) {
        item.checkItem();
        item.node.active = false
        result.isFilled = true;
      }
    }
    result.isCompleteAllItems = !this.itemsArr.some((item) => !item.isChecked);
    console.log("vao 1");
    if (result.isCompleteAllItems) {
      this.checkNode.active = true;
      this.node.children.forEach((item) => {
        if (item.name !== "Check") {
          item.active = false;
        }
      });
    }
    return result;
  }
}
