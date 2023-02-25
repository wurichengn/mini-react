import { Fiber } from './fiber';
import { Scheduler } from './scheduler';

/** 遍历器,根据逻辑对fiber进行遍历 */
export class Traverser {
  /**
   * @param {Fiber} fiber 要遍历的fiber
   * @param {Events} events 遍历的回调方法
   */
  constructor(fiber, events) {
    this.fiber = fiber;
    this.events = events;
  }

  /** @type {Fiber} 即将要进行遍历的fiber集合 */
  fiber;
  /** @type {Events} 回调函数 */
  events;

  /** 进入下一步状态 */
  next() {
    const { fiber, events } = this;
    // 如果fiber为空则遍历结束了
    if (fiber == null) {
      events.onFinish && events.onFinish();
      return;
    }

    if (fiber.state === 0) {
      // 递阶段执行begin
      fiber.state = 1;
      events.onBegin && events.onBegin(fiber);
      if (fiber.child) {
        events.onChild && events.onChild(fiber, fiber.child);
        this.fiber = fiber.child;
      }
    } else if (fiber.state === 1) {
      // 子节点阶段切换到兄弟节点
      fiber.state = 2;
      if (fiber.sibling) {
        // 有兄弟节点的fiber在sbling阶段进行归操作
        events.onEnd && events.onEnd(fiber);
        events.onSibling && events.onSibling(fiber, fiber.sibling);
        this.fiber = fiber.sibling;
        fiber.state = 0;
      }
    } else if (fiber.state === 2) {
      // 兄弟节点遍历结束
      fiber.state = 0;
      events.onEnd && events.onEnd(fiber);
      this.fiber = fiber.return;
      if (fiber.return) {
        events.onReturn && events.onReturn(fiber, fiber.return);
      }
    }
  }
}

/** 遍历器全局的调度器 */
const scheduler = new Scheduler();

/**
 * 进行一次fiber遍历
 * @param {Fiber} fiber 要遍历的fiber
 * @param {Events} events 遍历的回调方法
 * @param {number} level 遍历任务的优先级
 */
export const runTraverser = async (fiber, events = {}, level) => {
  return new Promise((next) => {
    // 覆写遍历结束方法
    events.onFinish = () => {
      cb();
      next();
    };

    /** 本次任务的遍历器 */
    const traverser = new Traverser(fiber, events);

    // 将遍历任务添加到调度器
    const cb = scheduler.addTask(() => {
      traverser.next();
    }, level);
  });
};

/** 遍历回调的定义 */
class Events {
  /**
   * 节点开始递时回调
   * @param {Fiber} fiber 开始递阶段的fiber
   */
  onBegin = (fiber) => {};
  /**
   * 节点开始归时回调
   * @param {Fiber} fiber 开始归阶段的fiber
   */
  onEnd = (fiber) => {};
  /**
   * 切换到子节点
   * @param {Fiber} fiber
   * @param {Fiber} target
   */
  onChild = (fiber, target) => {};
  /**
   * 切换到兄弟节点
   * @param {Fiber} fiber
   * @param {Fiber} target
   */
  onSibling = (fiber, target) => {};
  /**
   * 切换到父节点
   * @param {Fiber} fiber
   * @param {Fiber} target
   */
  onReturn = (fiber, target) => {};
  /** 整体遍历结束 */
  onFinish = () => {};
}
