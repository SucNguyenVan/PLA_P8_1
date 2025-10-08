// assets/scripts/utils/FlyCloneOneShot.ts
import {
  Node,
  Vec3,
  tween,
  Tween,
  TweenEasing,
  UIOpacity,
  instantiate,
} from "cc";

/**
 * Clone toàn bộ subtree của nodeA, đặt clone chồng đúng world transform của A,
 * tween clone bay tới nodeB rồi destroy clone khi tới nơi.
 * Trả về Promise<void> để có thể await.
 */
export function flyToAndHideReset(
  nodeA: Node,
  nodeB: Node,
  duration: number = 0.2,
  easing: TweenEasing | ((k: number) => number) = "quadOut",
  parentForClone: Node | null = nodeA.parent ?? null
): Promise<void> {
  try {
    return new Promise<void>((resolve) => {
      if (!nodeA || !nodeB) {
        resolve();
        return;
      }

      // 1) Tạo clone (bao gồm toàn bộ node con)
      const clone = instantiate(nodeA);

      // 2) Đặt parent cho clone (mặc định: cùng parent với A)
      if (parentForClone) {
        parentForClone.addChild(clone);
      }

      // 3) Đồng bộ transform world từ A sang clone
      clone.setWorldPosition(nodeA.worldPosition);
      clone.setWorldRotation(nodeA.worldRotation);
      clone.setWorldScale(nodeA.worldScale);

      // 4) Đảm bảo clone đang hiển thị (phòng trường hợp A đang mờ/ẩn)
      clone.active = true;
      let uiop = clone.getComponent(UIOpacity);
      if (!uiop) uiop = clone.addComponent(UIOpacity);
      uiop.opacity = 255;

      // 5) Dừng mọi tween cũ trên clone (nếu có)
      Tween.stopAllByTarget(clone);

      // 6) Tween bay tới B (world space), xong thì destroy clone
      const endWorld: Vec3 = nodeB.worldPosition.clone();

      tween(clone)
        .to(duration, { worldPosition: endWorld } as any, { easing })
        .call(() => {
          // Biến mất: huỷ clone
          clone.destroy();
          resolve();
        })
        .start();
    });
  } catch (error) {}
}
