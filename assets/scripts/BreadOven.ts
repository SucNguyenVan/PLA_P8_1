// assets/scripts/BreadOven.ts
import { _decorator, Component, Node } from "cc";
import { sp } from "cc";
import { Plate } from "./Plate";
import { Loading } from "./Loading";

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

  @property({ type: Node, tooltip: "node loading" })
  loadingFull: Node | null = null;

  @property({ type: Node, tooltip: "node loading 2" })
  loadingFull2: Node | null = null;

  // ---- State nội bộ
  private _status: FoodStatus = FoodStatus.Idle;
  private _runId = 0; // token vô hiệu hoá các callback đã schedule

  // =========================================================
  // Helpers
  hiddenLoadingLv1() {
    const loadingScript = this.loadingFull.getComponent(Loading);
    if (loadingScript) {
      loadingScript.hiddenLoading();
    }
  }

  hiddenLoadingLv2() {
    const loadingScript = this.loadingFull2.getComponent(Loading);
    if (loadingScript) {
      loadingScript.hiddenLoading();
    }
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
        console.warn(
          `[Spine] Animation not found: "${name}". Available:`,
          names
        );
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

  /** Đang nấu = Lv1 hoặc Lv2 */
  public getIsCookingBread(): boolean {
    return this._status === FoodStatus.Lv1 || this._status === FoodStatus.Lv2;
  }

  // =========================================================
  // Flow chính
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
      this.setBreadStatus(FoodStatus.Lv2, true); // loop để giữ trạng thái cho tới khi cháy
      const loadingScript2 = this.loadingFull2.getComponent(Loading);
      if (loadingScript2) {
        loadingScript2.playLoading(burnDelay);
      }
    }, cookDelay);
    const loadingScript = this.loadingFull.getComponent(Loading);
    if (loadingScript) {
      loadingScript.playLoading(cookDelay);
    }
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

  // =========================================================
  // Tương tác click: nếu đang Lv2 thì đặt lên plate1/plate2
  private onClickSelf() {
    if (this._status !== FoodStatus.Lv2) return;

    const p1 = this.plate1?.getComponent(Plate) ?? null;
    if (p1 && !p1.getIsDisplayingFood()) {
      p1.displayFood();
      this.resetToStart();
      this.hiddenLoadingLv2();
      return;
    }

    const p2 = this.plate2?.getComponent(Plate) ?? null;
    if (p2 && !p2.getIsDisplayingFood()) {
      p2.displayFood();
      this.resetToStart();
      this.hiddenLoadingLv2();
      return;
    }
  }

  // =========================================================
  // Lifecycle – gắn/tháo listener đúng vòng đời
  protected onEnable(): void {
    this.node.on(Node.EventType.TOUCH_START, this.onClickSelf, this);
  }

  protected onDisable(): void {
    this.node.off(Node.EventType.TOUCH_START, this.onClickSelf, this);
    this.unscheduleAllCallbacks();
    this._runId++; // chắc chắn vô hiệu mọi callback cũ
  }
}
