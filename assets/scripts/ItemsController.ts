import { _decorator, Component, Node } from "cc";
import { Item } from "./Item";
import { PlateType } from "./Enum";
import { flyToAndHideReset } from "./FlyTo";
import { TripleHealthBar } from "./TripleHealthBar";

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

  @property({
    type: Node,
    tooltip: "",
  })
  timeBar: Node;

  start() {
    this.checkNode.active = false;
  }

  update(deltaTime: number) {}

  async fillItemAction(plateType: PlateType, foodNode: Node) {
    let result = {
      isFilled: false,
      isCompleteAllItems: false,
    };
    for (let item of this.itemsArr) {
      if (!item.isChecked && item.itemType === plateType) {
        item.checkItem();
        await flyToAndHideReset(foodNode, item.node);
        item.node.active = false;
        result.isFilled = true;
      }
    }
    result.isCompleteAllItems = !this.itemsArr.some((item) => !item.isChecked);
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

  startTimeBar(){
    const TripleHealthBarScript = this.timeBar.getComponent(TripleHealthBar)
    if(TripleHealthBarScript){
      TripleHealthBarScript.startCountdown()
    }
  }
}
