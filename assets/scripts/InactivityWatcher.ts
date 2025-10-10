// assets/scripts/InactivityWatcher.ts
import {
  _decorator,
  Component,
  input,
  Input,
  EventTouch,
  EventMouse,
  EventKeyboard,
  game,
  Game,
  EventHandler,
  Node,
} from "cc";
import { ScanPlates } from "./ScanPlates";
import { ScanBreadOvens } from "./ScanBreadOvens";
import { ScanBreadFood } from "./ScanBreadFood";
const { ccclass, property } = _decorator;

@ccclass("InactivityWatcher")
export class InactivityWatcher extends Component {
  @property({ tooltip: "Số giây không thao tác để coi là idle" })
  idleSeconds: number = 5;

  @property({
    type: [EventHandler],
    tooltip:
      "Các callback sẽ gọi khi idle (kéo Target + Component + Handler trong Inspector).",
  })
  onIdleHandlers: EventHandler[] = [];

  @property({ tooltip: "Tên sự kiện sẽ emit trên node này khi idle" })
  idleEventName: string = "user-idle";

  @property({ type: Node, tooltip: "Tùy chọn: Node gợi ý (sẽ bật khi idle)" })
  hintNode: Node | null = null;

  @property({ tooltip: "Tự đếm lại sau khi idle" })
  autoRepeat: boolean = false;

  @property({
    type: ScanPlates,
    tooltip: "",
  })
  scanPlatesScript: ScanPlates;

  @property({
    type: ScanBreadOvens,
    tooltip: "",
  })
  scanBreadOvensScript: ScanBreadOvens;

  @property({
    type: ScanBreadFood,
    tooltip: "",
  })
  scanBreadFoodScript: ScanBreadFood;

  _scheduled = false;

  isCanScan = true

  onEnable() {
    input.on(Input.EventType.TOUCH_START, this.onAnyInput, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onAnyInput, this);
    input.on(Input.EventType.TOUCH_END, this.onAnyInput, this);
    input.on(Input.EventType.MOUSE_DOWN, this.onAnyInput, this);
    input.on(Input.EventType.MOUSE_MOVE, this.onAnyInput, this);
    input.on(Input.EventType.MOUSE_UP, this.onAnyInput, this);
    input.on(Input.EventType.MOUSE_WHEEL, this.onAnyInput, this);
    input.on(Input.EventType.KEY_DOWN, this.onAnyInput, this);
    input.on(Input.EventType.KEY_UP, this.onAnyInput, this);

    game.on(Game.EVENT_HIDE, this.onAppHide, this);
    game.on(Game.EVENT_SHOW, this.onAppShow, this);

    this.resetTimer();
  }

  onDisable() {
    this.clearTimer();

    input.off(Input.EventType.TOUCH_START, this.onAnyInput, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onAnyInput, this);
    input.off(Input.EventType.TOUCH_END, this.onAnyInput, this);
    input.off(Input.EventType.MOUSE_DOWN, this.onAnyInput, this);
    input.off(Input.EventType.MOUSE_MOVE, this.onAnyInput, this);
    input.off(Input.EventType.MOUSE_UP, this.onAnyInput, this);
    input.off(Input.EventType.MOUSE_WHEEL, this.onAnyInput, this);
    input.off(Input.EventType.KEY_DOWN, this.onAnyInput, this);
    input.off(Input.EventType.KEY_UP, this.onAnyInput, this);

    game.off(Game.EVENT_HIDE, this.onAppHide, this);
    game.off(Game.EVENT_SHOW, this.onAppShow, this);
  }

  onAnyInput(_e: EventTouch | EventMouse | EventKeyboard) {
    // Có thao tác -> tắt hint nếu đang bật và reset timer
    if (this.hintNode) this.hintNode.active = false;
    this.resetTimer();
  }

  onAppHide() {
    this.clearTimer();
  }

  onAppShow() {
    this.resetTimer();
  }

  clearTimer() {
    if (this._scheduled) {
      this.unschedule(this.triggerIdle);
      this._scheduled = false;
    }
  }

  resetTimer() {
    this.clearTimer();
    if (this.idleSeconds <= 0) return;
    this.scheduleOnce(this.triggerIdle, this.idleSeconds);
    this._scheduled = true;
  }

  /** <<< Đây là nơi chạy logic sau 5s không thao tác >>> */
  triggerIdle = () => {
    // this._scheduled = false;

    // // 1) Gọi các handler đã cấu hình trong Inspector
    // EventHandler.emitEvents(this.onIdleHandlers, this);

    // // 2) Emit sự kiện để nơi khác có thể .on('user-idle', ...) và bắt
    // if (this.idleEventName) {
    //   this.node.emit(this.idleEventName);
    // }

    // // 3) (Tùy chọn) Bật node gợi ý
    // if (this.hintNode) this.hintNode.active = true;

    // // 4) (Nếu cần) tiếp tục đếm lại
    // if (this.autoRepeat) this.resetTimer();
    console.log("le xing");
    if(!this.isCanScan) return
    if (this.scanPlatesScript && this.scanPlatesScript?.scanPlates()) return;
    console.log("vao 1");
    if (
      this.scanBreadOvensScript &&
      this.scanBreadOvensScript?.scanBreadOvens()
    )
      return;
    console.log("vao 2");
    this.scanBreadFoodScript?.scanBreadFood();
  };

  scanOffAll(){
    this.isCanScan = false
    this.scanPlatesScript && this.scanPlatesScript?.scanOffPlates()
    this.scanBreadOvensScript && this.scanBreadOvensScript?.scanOffBreadOvens()
    this.scanBreadFoodScript?.scanOffBreadFood();
  }
}
