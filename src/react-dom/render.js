import React from 'react';

/**
 * 渲染jsx到指定真实节点
 * @param {JSX.Element} jsx 要渲染的虚拟节点
 * @param {HTMLElement} element 要渲染到的真实节点
 */
export const render = (jsx, element) => {
  // 初始化根fiber
  element.__fiberRoot = element.__fiberRoot || new React.Fiber();
  element.__fiberRoot.dom = element;

  // 从根fiber进行渲染
  return React.render(jsx, element.__fiberRoot);
};
