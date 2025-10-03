import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Plate")
export class Plate extends Component {
  @property({
    type: Node,
    tooltip: "node cho bread",
  })
  food: Node;
  start() {
    this.food.active = false
  }

  update(deltaTime: number) {}

  displayFood(){
    this.food.active = true
  }

  getIsDisplayingFood(){
    return this.food.active
  }
}
