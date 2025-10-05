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

  start() {}

  update(deltaTime: number) {}

  fillItemAction(plateType: PlateType) {
    let result = {
      isFilled: false,
      isCompleteAllItems: false,
    };
    for (let item of this.itemsArr) {
      if (!item.isChecked && item.itemType === plateType) {
        item.checkItem();
        result.isFilled = true;
      }
    }
    result.isCompleteAllItems = !this.itemsArr.some((item) => !item.isChecked);
    return result;
  }
}
