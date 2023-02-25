
/**
 * 创建虚拟节点
 * @param {()=>{}|string} type 节点的类型
 * @param {*} attrs 属性
 * @param  {...any} children 子节点
 */
export const createElement = (type, props, ...children) => {
  children = children.flat(100);
  return {
    type: type,
    key: props?.key,
    props: { ...props, children }
  };
};
