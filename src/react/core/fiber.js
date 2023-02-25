
/** React fiber对象 */
export class Fiber {
  constructor(par) {
    this.return = par;
  }

  /** 当前节点的ref对象 */
  ref = null;
  /** 当前fiber包含的状态和effect */
  hooks = [];
  /** 组件类型 */
  type = null;
  /** @type {Fiber} fiber的参照对象 */
  reference = null;
  /** 当前节点对应的虚拟节点 */
  vdom = null;
  /** 当前节点对应的真实节点 */
  dom = null;
  /** @type {Fiber} 首个子节点 */
  child = null;
  /** @type {Fiber} 下一个兄弟节点 */
  sibling = null;
  /** @type {Fiber} 父节点 */
  return = null;
  /** @type {Fiber} 下一个要修改的fiber */
  next = null;
  /** 当前的标记 */
  flags = {
    /** 添加 */
    append: false,
    /** 是否存在属性变化 */
    attr: false,
    /** 是否需要删除 */
    delete: false,
    /** 是否重渲染了 */
    render: false,
    /** 文本是否改变了 */
    text: false
  };
  /** @type {0|1|2} 状态  0递阶段 1子节点阶段  2兄弟节点阶段 */
  state = 0;
}
