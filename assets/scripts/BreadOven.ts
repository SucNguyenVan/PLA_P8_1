// assets/scripts/BreadOven.ts
import { _decorator, Component, Node } from "cc";
import { sp } from "cc";
import { Plate } from "./Plate";
import { Loading } from "./Loading";
import * as Sfx from "./Sfx";

const { ccclass, property } = _decorator;

export enum FoodStatus {
  Idle = "idle",
  Lv1 = "lv1",
  Lv2 = "lv2",
  Lv3 = "lv3",
}

@ccclass("BreadOven")
export class BreadOven extends Component {
  @property({ type: Node, tooltip: "Node chứa sp.Skeleton của bread" })
  bread: Node | null = null;

  @property({ tooltip: "Giây từ lúc bắt đầu -> chín (Lv2)" })
  cookedTime: number = 4;

  @property({ tooltip: "Giây thêm từ khi chín -> cháy (Lv3)" })
  burntTime: number = 4;

  @property({ type: Node, tooltip: "Đĩa 1" })
  plate1: Node | null = null;

  @property({ type: Node, tooltip: "Đĩa 2" })
  plate2: Node | null = null;

  @property({ type: Node, tooltip: "Đĩa 3" })
  plate3: Node | null = null;

  @property({ type: Node, tooltip: "Đĩa 4" })
  plate4: Node | null = null;

  @property({ type: Node, tooltip: "Thùng rác" })
  trash: Node | null = null;

  @property({ type: Node, tooltip: "node loading Lv1" })
  loadingFull: Node | null = null;

  @property({ type: Node, tooltip: "node loading Lv2" })
  loadingFull2: Node | null = null;

  @property({ type: Node, tooltip: "Tay hướng dẫn" })
  handNode: Node | null = null;

    @property({
    type: Boolean,
    tooltip: "",
  })
  isFirstBreadOven = false;

  isPressedFirst = false;

  // ---- State nội bộ
  _status: FoodStatus = FoodStatus.Idle;
  _runId = 0; // token vô hiệu hoá các callback đã schedule

  protected start(): void {
    if (this.handNode) {
      this.handNode.active = false;
    }
  }

  // Helpers
  hiddenLoadingLv1() {
    const loadingScript = this.loadingFull?.getComponent(Loading);
    loadingScript?.hiddenLoading();
  }

  hiddenLoadingLv2() {
    const loadingScript = this.loadingFull2?.getComponent(Loading);
    loadingScript?.hiddenLoading();
  }

  private getSkeleton(): sp.Skeleton | null {
    return this.bread?.getComponent(sp.Skeleton) ?? null;
  }

  /** Reset pose cứng để tránh "dính" slot/attachment từ anim trước */
  private hardResetPose(sk: sp.Skeleton) {
    sk.clearTracks(); // dừng toàn bộ track
    sk.setToSetupPose(); // hoặc sk.setSlotsToSetupPose();
    // Nếu đang dùng Animation Cache Mode != REALTIME, hãy làm mới cache:
    (sk as any).invalidAnimationCache?.();
  }

  /** Phát anim Spine an toàn: chỉ chạy khi Skeleton đã ready + anim tồn tại */
  private playSpineSafe(comp: sp.Skeleton, name: string, loop = true) {
    const tryPlay = () => {
      const s: any = (comp as any)._skeleton;
      if (!s || !s.data) {
        this.scheduleOnce(tryPlay, 0); // đợi frame kế nếu chưa ready
        return;
      }
      const anim = s.data.findAnimation(name.trim());
      if (!anim) {
        const names = s.data.animations.map((a: any) => a.name);
        console.warn(`[Spine] Animation not found: "${name}". Available:`, names);
        return;
      }
      comp.clearTrack(0);
      comp.setAnimation(0, name, loop);
    };
    tryPlay();
  }

  /** Chỉ đổi animation + cập nhật trạng thái. KHÔNG schedule ở đây. */
  private setBreadStatus(status: FoodStatus, loop = false) {
    const sk = this.getSkeleton();
    if (!sk) return;
    this._status = status;
    this.hardResetPose(sk); // tránh dính khung/lag khi đổi anim
    this.playSpineSafe(sk, status, loop);
  }

  /** Đang nấu = Lv1 hoặc Lv2 hoặc Lv3 (cháy) */
  public getIsCookingBread(): boolean {
    return (
      this._status === FoodStatus.Lv1 ||
      this._status === FoodStatus.Lv2 ||
      this._status === FoodStatus.Lv3
    );
  }

  /** Bắt đầu nướng: Lv1 ngay, Lv2 sau cookedTime, Lv3 sau cookedTime + burntTime */
  public spawnBread() {
    // Vô hiệu mọi callback cũ và huỷ lịch
    this._runId++;
    this.unscheduleAllCallbacks();

    // Bắt đầu
    this.setBreadStatus(FoodStatus.Lv1, false);

    const id = this._runId;
    const cookDelay = Math.max(0, this.cookedTime);
    const burnDelay = Math.max(0, this.burntTime);

    // Lên Lv2 (chỉ khi còn đúng runId và trạng thái hợp lệ)
    this.scheduleOnce(() => {
      if (this._runId !== id) return;
      if (this._status !== FoodStatus.Lv1) return;
      if (this.handNode && !this.isPressedFirst && this.isFirstBreadOven) {
        this.handNode.active = true;
      }
      this.setBreadStatus(FoodStatus.Lv2, true); // loop để giữ trạng thái cho tới khi cháy
      const loadingScript2 = this.loadingFull2?.getComponent(Loading);
      loadingScript2?.playLoading(burnDelay);
    }, cookDelay);

    const loadingScript = this.loadingFull?.getComponent(Loading);
    loadingScript?.playLoading(cookDelay);

    // Lên Lv3 (cháy) sau tổng thời gian
    this.scheduleOnce(() => {
      if (this._runId !== id) return;
      if (this._status !== FoodStatus.Lv2) return;
      this.setBreadStatus(FoodStatus.Lv3, true);
    }, cookDelay + burnDelay);
  }

  /** Lấy bánh ra đĩa thành công -> reset về Idle và huỷ các lịch đang chờ */
  private resetToStart() {
    this._runId++; // vô hiệu các callback đã schedule
    this.unscheduleAllCallbacks();
    const sk = this.getSkeleton();
    if (sk) this.hardResetPose(sk);
    this.setBreadStatus(FoodStatus.Idle, false);
  }

  // Tương tác click: nếu đang Lv2 thì đặt lên plate1/2/3/4
  private onClickSelf() {
    if (this.handNode?.active) {
      this.handNode.active = false;
    }

    if (this._status === FoodStatus.Lv2) {
      // Thứ tự ưu tiên: 1 → 2 → 3 → 4
      const candidates: (Node | null)[] = [this.plate1, this.plate2, this.plate3, this.plate4];

      for (const pNode of candidates) {
        const p = pNode?.getComponent(Plate) ?? null;
        if (p && !p.getIsDisplayingFood()) {
          p.displayFood();
          Sfx.play();
          this.resetToStart();
          this.hiddenLoadingLv2();
          return;
        }
      }
      // nếu không có đĩa trống nào -> không làm gì
    } else if (this._status === FoodStatus.Lv3) {
      const trashSkeleton = this.trash?.getComponent(sp.Skeleton) ?? null;
      if (trashSkeleton) {
        this.hardResetPose(trashSkeleton);
        this.playSpineSafe(trashSkeleton, "on", false);
        this.resetToStart();
      }
    }
  }


  protected onEnable(): void {
    this.node.on(Node.EventType.TOUCH_START, this.onClickSelf, this);
  }

  protected onDisable(): void {
    this.node.off(Node.EventType.TOUCH_START, this.onClickSelf, this);
    this.unscheduleAllCallbacks();
    this._runId++; // chắc chắn vô hiệu mọi callback cũ
  }
}
