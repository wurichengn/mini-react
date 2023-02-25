import { createFiberTreeFromVdom } from 'react/utils/create-fiber-tree';
import { RunFiberEffect } from './effect-mgr';
import { Fiber } from './fiber';
import { render, SetModuleFiber } from './render';

/** 等待重渲染的fiber集合 */
const rerenderList = [];

/**
 * 添加一个待重渲染的组件
 * @param {Fiber} fiber 要重渲染的fiber
 * @param {number} level 渲染的优先级
 */
export const AddReRender = (fiber, level = 0) => {
  if (rerenderList.indexOf(fiber) >= 0) return;
  rerenderList.push([fiber, level]);
};

const step = () => {
  requestAnimationFrame(step);
  while (rerenderList.length > 0) {
    (async(item, level) => {
      const type = item.type;
      if (typeof type === 'function') {
        // 运行重渲染
        let vdom;
        SetModuleFiber(item, () => {
          vdom = type(item.vdom.props);
        });
        // 执行局部更新
        await render(vdom, item, level);
        // 运行副作用
        RunFiberEffect(item);
      }
    })(rerenderList[0][0], rerenderList[0][1]);
    rerenderList.splice(0, 1);
  }
};
step();
