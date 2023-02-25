
/** 超级简陋的调度器 */
export class Scheduler {
  constructor() {
    const step = () => {
      requestAnimationFrame(step);
      // 记录最大时间
      const time = Date.now() + this.maxTime;
      // 循环执行任务
      while (Date.now() < time) {
        // 取出当前的任务
        const task = this.tasks[0];
        // 如果全部结束
        if (task == null) return;
        task.cb();
      }
    };
    step();
  }

  /** 要调度的所有任务 */
  tasks = [];
  /** 单次任务最多运行时间,默认20ms */
  maxTime = 20;

  /**
   * 添加一个任务
   * @param {()=>{}} cb 任务运行的方法
   * @param {number} level 任务的优先级
   * @returns 释放任务析构方法
   */
  addTask(cb, level = 0) {
    const data = { cb, level };
    this.tasks.push(data);
    this.tasks.sort((a, b) => b.level - a.level);
    return () => {
      this.tasks.splice(this.tasks.indexOf(data), 1);
    };
  }
}
