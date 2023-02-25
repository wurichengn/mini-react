import { Fiber } from './fiber';

/** 等待重渲染的fiber集合 */
const effectList = [];

/**
 * 添加一个等待运行的副作用
 * @param {()=>{}} effect 副作用回调
 */
export const AddEffect = (effect) => {
  effectList.push(effect);
};

const step = () => {
  requestAnimationFrame(step);
  while (effectList.length > 0) {
    const item = effectList[0];
    item();
    effectList.splice(0, 1);
  }
};
step();

/**
 * 运行fiber需要执行的副作用
 * @param {Fiber} fiber
 */
export const RunFiberEffect = (fiber) => {
  fiber.hooks.forEach(hook => {
    if (hook.type === 'effect') {
      // 是否需要更新副作用
      if (hook.needRun) {
        hook.needRun = false;
        // 析构上次内容
        if (hook.dispos) hook.dispos();
        // 重新运行副作用
        hook.dispos = hook.value();
      }
    }
  });
};
