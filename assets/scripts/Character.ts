// assets/scripts/Character.ts
import { _decorator, Component, Node, Vec3, sp } from "cc";
import { PlateType } from "./Enum";
import { ItemsController } from "./ItemsController";
const { ccclass, property } = _decorator;

@ccclass("Character")
export class Character extends Component {
  @property({ type: Node, tooltip: "Node chứa sp.Skeleton (Spine)" })
  body: Node | null = null;

  @property({ type: Node, tooltip: "Điểm đến (Node)" })
  destination: Node | null = null;

  @property({ tooltip: "Tốc độ di chuyển (đơn vị/giây)" })
  speed: number = 300;

  @property({ tooltip: "Khoảng cách coi như đã tới đích" })
  stopDistance: number = 0; // bạn vẫn có thể để 0

  @property({ tooltip: "Ngưỡng kỹ thuật chống kẹt do sai số (rất nhỏ)" })
  arrivalEpsilon: number = 0.001;

  @property({ tooltip: "Tự lật ngang body theo hướng di chuyển" })
  autoFlipX: boolean = true;

  @property({ type: Node, tooltip: "Node chứa items" })
  items: Node | null = null;

  isShowItem = false;

  private _tmp = new Vec3();
  private _arrived = false;

  start() {
    this.items.active = false;
    if (this.destination) this.playAnim("move", true);
  }

  update(dt: number) {
    if (!this.destination || this._arrived) return;

    const cur = this.node.worldPosition;
    const target = this.destination.worldPosition;

    // vector tới đích + khoảng cách còn lại
    Vec3.subtract(this._tmp, target, cur);
    let dist = this._tmp.length();

    // threshold thực tế (luôn >= epsilon để tránh kẹt)
    const threshold = Math.max(this.stopDistance, this.arrivalEpsilon);

    // Nếu đã đủ gần → snap & tới
    if (dist <= threshold) {
      this.node.setWorldPosition(target);
      this._arrived = true;
      this.playAnim("idle_nor", true);
      return;
    }

    // Hướng & bước di chuyển
    const dir = this._tmp.normalize();
    const step = this.speed * dt;

    // Nếu bước đi >= khoảng cách còn lại → snap ngay trong frame này
    if (step >= dist) {
      this.node.setWorldPosition(target);
      this._arrived = true;
      this.playAnim("idle_nor", true);
      this.items.active = true;
      this.isShowItem = true;
      return;
    }

    // Tự lật body theo hướng đi
    if (this.autoFlipX && this.body) {
      const s = this.body.scale;
      const sign = dir.x < 0 ? -1 : 1;
      if (Math.sign(s.x) !== sign) {
        this.body.setScale(Math.abs(s.x) * sign, s.y, s.z);
      }
    }

    // Cập nhật vị trí
    const next = new Vec3(
      cur.x + dir.x * step,
      cur.y + dir.y * step,
      cur.z + dir.z * step
    );
    this.node.setWorldPosition(next);

    // Đảm bảo đang phát anim "move" khi còn đang đi
    this.ensureMovingAnim();
  }

  // -------- Helpers --------
  private ensureMovingAnim() {
    const sk = this.body?.getComponent(sp.Skeleton);
    if (!sk) return;
    if (sk.animation !== "move") this.playAnim("move", true);
  }

  private playAnim(name: string, loop: boolean) {
    const sk = this.body?.getComponent(sp.Skeleton);
    if (!sk) {
      console.warn("[Character] body không có sp.Skeleton");
      return;
    }
    sk.setAnimation(0, name, loop);
  }

  public setDestination(dest: Node | Vec3) {
    if (dest instanceof Node) {
      this.destination = dest;
    } else {
      const holder = new Node("TempDestination");
      holder.setWorldPosition(dest);
      this.destination = holder;
    }
    this._arrived = false;
    this.playAnim("move", true);
  }

  fillItem(plateType: PlateType) {
    if (!this.isShowItem) return null;
    const itemsControllerScript = this.items.getComponent(ItemsController);
    if (!itemsControllerScript) return null;
    const result = itemsControllerScript.fillItemAction(plateType);
    return result;
  }
}
