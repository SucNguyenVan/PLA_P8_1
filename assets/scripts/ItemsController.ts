import { _decorator, Component, Node } from "cc";
import { Item } from "./Item";
import { PlateType } from "./Plate";

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

  fillItem(plateType: PlateType){
    for(let item of this.itemsArr){
        if(!item.isChecked && item.itemType === plateType){
            item.checkItem()
        }
    }
  }
}
