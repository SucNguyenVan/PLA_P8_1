import { _decorator, Component, Node } from "cc";
import { Plate } from "./Plate";
import { PlateType } from "./Enum";
const { ccclass, property } = _decorator;

@ccclass("ScanPlates")
export class ScanPlates extends Component {
  @property({
    type: [Plate],
    tooltip: "",
  })
  platesArr: Plate[] = [];
  start() {}

  update(deltaTime: number) {}

  scanPlates(){
    let result = false
    for(let plate of this.platesArr){
        if(plate.handNode.active){
            result = true;
            break
        }
        if(plate.plateType !== PlateType.Idle){
            plate.handNode.active = true
            result = true
            break
        }
    }
    return result
  }
}
