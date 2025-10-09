// assets/scripts/Sauce.ts
import { _decorator, Component, Node } from "cc";
import { Plate } from "./Plate";
import { PlateTypeEnum, PlateType } from "./Enum";

const { ccclass, property } = _decorator;

@ccclass("Sauce")
export class Sauce extends Component {
  @property({
    type: PlateTypeEnum,
    tooltip: "Loại sauce sẽ set lên đĩa có sẵn thức ăn (OnlyFood).",
  })
  sauceType: PlateType = PlateType.Idle; // đặt giá trị mặc định phù hợp enum của bạn

  @property({ type: Node, tooltip: "Đĩa 1" })
  plate1: Node;

  @property({ type: Node, tooltip: "Đĩa 2" })
  plate2: Node;

  @property({ type: Node, tooltip: "Đĩa 3" })
  plate3: Node;

  @property({ type: Node, tooltip: "Đĩa 4" })
  plate4: Node;

  start() {}

  update(deltaTime: number) {}

  protected onEnable(): void {
    this.node.on(Node.EventType.TOUCH_START, this.onClick, this);
  }

  protected onDisable(): void {
    this.node.off(Node.EventType.TOUCH_START, this.onClick, this);
  }

  private trySetSauce(plateNode: Node | null | undefined): boolean {
    if (!plateNode) return false;
    const plate = plateNode.getComponent(Plate);
    if (!plate) return false;
    if (plate.plateType === PlateType.OnlyFood) {
      plate.setPlateType(this.sauceType);
      return true;
    }
    return false;
  }

  private onClick() {
    // Ưu tiên lần lượt plate1 -> plate2 -> plate3 -> plate4
    if (this.trySetSauce(this.plate1)) return;
    if (this.trySetSauce(this.plate2)) return;
    if (this.trySetSauce(this.plate3)) return;
    if (this.trySetSauce(this.plate4)) return;

    // nếu không có đĩa nào ở trạng thái OnlyFood thì không làm gì
  }
}
