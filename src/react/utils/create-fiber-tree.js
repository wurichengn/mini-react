import { Fiber } from 'react/core/fiber';

/**
 * 通过虚拟节点生成一个fiber树，会在组件节点处停止
 * @param {JSX.Element} vdom 要生成fiber树的虚拟节点
 * @param {Fiber} par fiber的父节点
 */
export const createFiberTreeFromVdom = (vdom, par) => {
  if (vdom == null) return null;
  /** 创建当前fiber节点 */
  const fiber = new Fiber(par);

  // 记录
  fiber.vdom = vdom;
  fiber.ref = vdom.props?.ref;
  fiber.type = vdom.type;
  if (['string', 'boolean', 'number'].includes(typeof vdom)) fiber.type = '#text';

  // 如果是基础节点则继续遍历
  if (typeof (vdom?.type) === 'string') {
    let lastNode = null;
    vdom.props?.children?.forEach(vdom => {
      const f = createFiberTreeFromVdom(vdom, fiber);
      if (fiber.child == null) fiber.child = f;
      if (lastNode)lastNode.sibling = f;
      lastNode = f;
    });
  }

  return fiber;
};
