import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("KitchenBread")
export class KitchenBread extends Component {
  @property({
    type: Node,
    tooltip: "hand node",
  })
  handNode: Node;
  start() {}

  update(deltaTime: number) {}
}
