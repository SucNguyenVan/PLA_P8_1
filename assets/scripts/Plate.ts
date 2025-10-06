import { _decorator, Component, Node } from "cc";
import { CharactersController } from "./CharactersController";
import { PlateType } from "./Enum";
const { ccclass, property } = _decorator;

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

  @property({
    type: Node,
    tooltip: "node cho yellow sauce",
  })
  charactersController: Node;

  @property({ type: Node, tooltip: "" })
  handNode: Node | null = null;

  isPressedFirst = false;

  plateType: PlateType = PlateType.Idle;

  start() {
    this.food.active = false;
    this.redSauce.active = false;
    this.yellowSauce.active = false;
    this.node.on(Node.EventType.TOUCH_START, this.onClick, this);
    if (this.handNode) {
      this.handNode.active = false;
    }
  }

  update(deltaTime: number) {}

  displayFood() {
    this.food.active = true;
    this.setPlateType(PlateType.OnlyFood);
  }

  getIsDisplayingFood() {
    return this.food.active;
  }

  setPlateType(type: PlateType) {
    if (this.handNode && !this.isPressedFirst) {
      this.handNode.active = true;
    }
    this.plateType = type;
    this.redSauce.active = false;
    this.yellowSauce.active = false;
    if (type === PlateType.RedSauce) {
      this.redSauce.active = true;
    } else if (type === PlateType.YellowSauce) {
      this.yellowSauce.active = true;
    }
  }

  resetPlate() {
    this.plateType = PlateType.Idle;
    this.food.active = false;
    this.yellowSauce.active = false;
    this.redSauce.active = false;
  }

  onClick() {
    if (this.handNode?.active) {
      this.handNode.active = false;
    }
    // quet character controller
    const charactersControllerScript =
      this.charactersController.getComponent(CharactersController);
    const result = charactersControllerScript.fillPlate(this.plateType);
    if (result?.isFilled) {
      this.resetPlate();
    }
  }
}
