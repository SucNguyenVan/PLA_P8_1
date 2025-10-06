import { _decorator, Component, Node, Enum } from "cc";
import { Plate } from "./Plate";
import { PlateTypeEnum, PlateType } from "./Enum";

const { ccclass, property } = _decorator;

@ccclass("Sauce")
export class Sauce extends Component {
  @property({
    type: PlateTypeEnum,
    tooltip: "loại Sauce",
  })
  sauceType: PlateType;

  @property({
    type: Node,
    tooltip: "",
  })
  plate1: Node;

  @property({
    type: Node,
    tooltip: "",
  })
  plate2: Node;
  start() {}

  update(deltaTime: number) {}

  protected onEnable(): void {
    this.node.on(Node.EventType.TOUCH_START, this.onClick, this);
  }

  onClick() {
    const plate1Script = this.plate1.getComponent(Plate);
    if (!plate1Script) return;
    if (plate1Script.plateType === PlateType.OnlyFood) {
      plate1Script.setPlateType(this.sauceType);
    } else {
      const plate2Script = this.plate2.getComponent(Plate);
      if (!plate2Script) return;
      if (plate2Script.plateType === PlateType.OnlyFood) {
        plate2Script.setPlateType(this.sauceType);
      }
    }
  }
}
