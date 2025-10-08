// assets/scripts/Character.ts
import { _decorator, Component, Node, Vec3, sp } from "cc";
import { PlateType } from "./Enum";
import { ItemsController } from "./ItemsController";
const { ccclass, property } = _decorator;

@ccclass("Character")
export class Character extends Component {
  @property({ type: Node, tooltip: "Node chứa sp.Skeleton (Spine)" })
  body: Node | null = null;

  @property({
    type: Node,
    tooltip:
      "Điểm đến (Node) - chỉ dùng để xem trước trong Editor, KHÔNG tự di chuyển",
  })
  destination: Node | null = null;

  @property({ type: Node, tooltip: "Điểm đến (Node) khi complete task" })
  destinationEnd: Node | null = null;

  @property({ tooltip: "Tốc độ di chuyển (đơn vị/giây)" })
  speed: number = 300;

  @property({ tooltip: "Khoảng cách coi như đã tới đích" })
  stopDistance: number = 0;

  @property({ tooltip: "Ngưỡng kỹ thuật chống kẹt do sai số" })
  arrivalEpsilon: number = 0.001;

  @property({ tooltip: "Tự lật ngang body theo hướng di chuyển" })
  autoFlipX: boolean = true;

  @property({ type: Node, tooltip: "Node chứa items (ẩn/hiện khi tới đích)" })
  items: Node | null = null;

  @property({ type: Number, tooltip: "Time delay trước khi nhân vật di chuyển" })
  delayTime: number = 0;
  // --- state ---
  isShowItem = false;

  isCompleteAllItems: boolean = false

  private _tmp = new Vec3();
  private _moving = false; // CHỈ di chuyển khi moveToNode() được gọi
  private _arrived = false;
  private _arrivalResolver: (() => void) | null = null;

  start() {
    // Không tự di chuyển khi vào game.
    // Chỉ set trạng thái ban đầu.
    if (this.items) this.items.active = false;
    this.isShowItem = false;

    // Đảm bảo anim idle ban đầu (nếu muốn)
    this.playAnim("idle_nor", true);
    this.scheduleOnce(()=>{
      this.moveToNode(this.destination);
    }, this.delayTime)
  }

  update(dt: number) {
    if (!this._moving || !this.destination) return;

    const cur = this.node.worldPosition;
    const target = this.destination.worldPosition;

    // vector tới đích + khoảng cách còn lại
    Vec3.subtract(this._tmp, target, cur);
    let dist = this._tmp.length();

    // threshold thực tế (luôn >= epsilon để tránh kẹt)
    const threshold = Math.max(this.stopDistance, this.arrivalEpsilon);

    // Nếu đã đủ gần → snap & tới
    if (dist <= threshold) {
      this._snapArrive(target);
      return;
    }

    // Hướng & bước di chuyển
    const dir = this._tmp.normalize();
    const step = this.speed * dt;

    // Nếu bước đi >= khoảng cách còn lại → snap ngay trong frame này
    if (step >= dist) {
      this._snapArrive(target);
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

  // -------- Public API --------

  /**
   * Bắt đầu di chuyển tới 1 Node mục tiêu.
   * Trả về Promise được resolve khi nhân vật tới nơi.
   */
  public moveToNode(target: Node): Promise<void> {
    this.node.setSiblingIndex(0)
    this.destination = target;
    this._arrived = false;
    this._moving = true;
    this.playAnim("move", true);

    // hủy promise trước đó (nếu có) bằng cách ghi đè resolver
    return new Promise<void>((resolve) => {
      this._arrivalResolver = resolve;
    });
  }

  /** Hủy di chuyển hiện tại (không đổi vị trí) */
  public cancelMove() {
    this._moving = false;
    this._arrived = false;
    // không resolve promise vì chưa tới nơi
    this.ensureIdleAnim();
  }

  /**
   * Đặt đích bằng toạ độ world rời rạc (nếu bạn cần)
   * Lưu ý: KHÔNG tự chạy — chỉ set; muốn chạy, hãy dùng moveToNode với một Node holder của bạn.
   */
  public setDestinationWorld(pos: Vec3) {
    const holder = new Node("TempDestination");
    holder.setWorldPosition(pos);
    this.destination = holder;
    // vẫn không di chuyển cho tới khi bạn gọi this._moving = true từ một hàm riêng (không khuyến nghị)
  }

  /** Gọi khi tới nơi để fill item (giữ nguyên như bạn đang dùng) */
  public fillItem(plateType: PlateType) {
    if (!this.isShowItem || !this.items) return null;
    const itemsControllerScript = this.items.getComponent(ItemsController);
    if (!itemsControllerScript) return null;
    const result = itemsControllerScript.fillItemAction(plateType);
    if (result.isCompleteAllItems) {
      this.isCompleteAllItems = true
      this.scheduleOnce(() => {
        this.items.active = false;
        this.playAnim("happy", false)
        this.scheduleOnce(()=>{
          this.moveToNode(this.destinationEnd);
        }, 1)
      }, 0.5);
    }
    return result;
  }

  // -------- Helpers --------
  private ensureMovingAnim() {
    const sk = this.body?.getComponent(sp.Skeleton);
    if (!sk) return;
    if (sk.animation !== "move") this.playAnim("move", true);
  }

  private ensureIdleAnim() {
    const sk = this.body?.getComponent(sp.Skeleton);
    if (!sk) return;
    if (sk.animation !== "idle") this.playAnim("idle", true);
  }

  private playAnim(name: string, loop: boolean) {
    const sk = this.body?.getComponent(sp.Skeleton);
    if (!sk) {
      console.warn("[Character] body không có sp.Skeleton");
      return;
    }
    sk.setAnimation(0, name, loop);
  }

  private _snapArrive(targetWorldPos: Vec3) {
    this.node.setWorldPosition(targetWorldPos);
    this._arrived = true;
    this._moving = false;

    // Hiển thị items khi đến nơi
    if (this.items) this.items.active = true;
    this.isShowItem = true;

    this.playAnim("idle_nor", true);

    // Resolve promise nếu đang chờ
    if (this._arrivalResolver) {
      this._arrivalResolver();
      this._arrivalResolver = null;
    }
  }

  onDisable() {
    // nếu node bị tắt giữa chừng, kết thúc chuyển động và không resolve promise
    this._moving = false;
  }
}
