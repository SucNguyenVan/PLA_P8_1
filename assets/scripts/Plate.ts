import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

export enum PlateType {
  Idle = 0,
  OnlyFood = 1,
  YellowSauce = 2,
  RedSauce = 3
}

@ccclass("Plate")
export class Plate extends Component {
  @property({
    type: Node,
    tooltip: "node cho bread",
  })
  food: Node;

  @property({
    type: Node,
    tooltip: "node cho red sauce",
  })
  redSauce: Node;

  @property({
    type: Node,
    tooltip: "node cho yellow sauce",
  })
  yellowSauce: Node;

  plateType: PlateType = PlateType.Idle

  start() {
    this.food.active = false;
    this.redSauce.active = false
    this.yellowSauce.active = false
  }

  update(deltaTime: number) {}

  displayFood() {
    this.food.active = true;
    this.setPlateType(PlateType.OnlyFood)
  }

  getIsDisplayingFood() {
    return this.food.active;
  }

  setPlateType(type: PlateType){
    this.plateType = type
    this.redSauce.active = false
    this.yellowSauce.active = false
    if(type === PlateType.RedSauce){
      this.redSauce.active = true
    }else if(type === PlateType.YellowSauce){
      this.yellowSauce.active = true
    }
  }
}
