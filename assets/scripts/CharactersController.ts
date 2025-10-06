import { _decorator, Component, Node } from "cc";
import { Character } from "./Character";
import { PlateType } from "./Enum";
const { ccclass, property } = _decorator;

@ccclass("CharactersController")
export class CharactersController extends Component {
  @property({
    type: [Character],
    tooltip: "all characters",
  })
  charactersArr: Character[] = [];

  @property({
    type: Node,
    tooltip: "all characters",
  })
  downloadNode: Node;
  start() {
    this.downloadNode.active = false;
  }

  update(deltaTime: number) {}

  fillPlate(plateType: PlateType) {
    let result = {
      isFilled: false,
    };
    for (let character of this.charactersArr) {
      const response = character.fillItem(plateType);
      if (response?.isFilled) {
        result.isFilled = response.isFilled;
        if (response?.isCompleteAllItems) {
          if (this.charactersArr.every((lx) => lx.isCompleteAllItems)) {
            this.scheduleOnce(() => {
              this.downloadNode.active = true;
            }, 2);
          }
        }
        break;
      }
    }
    return result;
  }
}
