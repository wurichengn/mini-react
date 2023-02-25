import { ArrayEqual } from 'react/utils/array-equal';
import { createFiberTreeFromVdom } from 'react/utils/create-fiber-tree';
import { ObjectEqual } from 'react/utils/object-equal';
import { RunFiberEffect } from './effect-mgr';
import { Fiber } from './fiber';
import { AddReRender } from './re-render-mgr';
import { runTraverser } from './traverser';

/** @type {Fiber} 当前正在执行的函数组件fiber */
let moduleFiber = null;
/** 当前hook计算下标 */
let hookIndex = 0;

/**
 * 守则执行fiber
 * @param {Fiber} fiber
 * @param {()=>{}} cb
 */
export const SetModuleFiber = (fiber, cb) => {
  hookIndex = 0;
  moduleFiber = fiber;
  cb && cb();
  moduleFiber = null;
};

/**
 * 使用jsx对fiber树进行重渲染处理
 * @param {JSX.Element} jsx
 * @param {Fiber} fiber 目标父节点
 * @param {number} level 优先级
 */
export const render = async (jsx, fiber, level) => {
  /** 从虚拟节点生成一颗fiber树 */
  const nfiber = createFiberTreeFromVdom(jsx);

  // 运行render阶段
  await TRender(nfiber, fiber.child, level);
  // 运行commit阶段
  const first = await TCommitBefore(nfiber, level);

  // 替换fiber树
  fiber.child = nfiber;
  nfiber.return = fiber;

  // 执行更新
  TCommit(first);
};

/**
 * render阶段遍历
 * @param {Fiber} nfiber 要遍历的fiber节点
 * @param {Fiber} ofiber 之前的fiber节点
 */
const TRender = async (nfiber, ofiber, level) => {
  /** @type {Fiber} 参照对象 */
  let mitfiber = ofiber;

  // 遍历fiber
  await runTraverser(nfiber, {
    // 切换子节点
    onChild: () => {
      if (mitfiber) mitfiber = mitfiber.child;
    },
    // 切换兄弟节点
    onSibling: () => {
      if (mitfiber) mitfiber = mitfiber.sibling;
    },
    // 切换到父节点
    onReturn: (fiber, target) => {
      if (target && target.reference) mitfiber = target.reference;
    },
    // ============递阶段============
    onBegin: (fiber) => {
      /** 当前fiber类型 */
      const type = fiber.type;
      // 记录参照fiber
      if (mitfiber) {
        fiber.reference = mitfiber;
      }

      // 如果类型不同则创建
      if (type != mitfiber?.type) {
        if (typeof type === 'string') {
          fiber.flags.append = true;
          if (type === '#text') {
            fiber.dom = document.createTextNode(fiber.vdom);
          } else {
            fiber.dom = document.createElement(type);
            if (fiber.ref) {
              fiber.ref.current = fiber.dom;
            }
          }
        }
        // 如果已存在节点,那么还需要删除
        if (mitfiber?.dom) {
          fiber.flags.delete = true;
        }
      } else {
        // 传递之前的hooks和dom
        if (mitfiber) {
          fiber.dom = mitfiber.dom;
          fiber.hooks = mitfiber.hooks;
        }
        // 如果是文本则判断文本是否改变
        if (fiber.type === '#text' && fiber.vdom !== mitfiber?.vdom) {
          fiber.flags.text = true;
        }
      }

      // 如果是组件则运行render方法
      if (typeof type === 'function') {
        let vdom;
        SetModuleFiber(fiber, () => {
          vdom = type(fiber.vdom.props);
        });
        if (vdom != null) {
          /** 创建fiber树 */
          const cfiber = createFiberTreeFromVdom(vdom, fiber);
          // 关联fiber树
          fiber.child = cfiber;
          fiber.flags.render = true;
        }
      } else {
        // 属性是否变化
        if (!ObjectEqual(fiber.vdom.props, mitfiber?.vdom?.props)) {
          fiber.flags.attr = true;
        }
      }
    },
    // ============归阶段============
    onEnd: (fiber) => {
      // 去掉参照物
      fiber.reference = null;
    }
  }, level);
};

/**
 * 遍历commit修改内容
 * @param {Fiber} fiber
 */
const TCommitBefore = async (fiber, level) => {
  /** @type {Fiber} 首个待处理节点 */
  let firstEffect = null;
  /** @type {Fiber} 最后一个要处理的节点  */
  let lastEffect = null;

  await runTraverser(fiber, {
    // 归阶段
    onEnd: (fiber) => {
      let hasFlag = false;
      for (var i in fiber.flags) {
        if (fiber.flags[i] === true) {
          hasFlag = true;
        }
      }
      if (!hasFlag) return;
      if (!firstEffect) firstEffect = fiber;
      if (lastEffect) lastEffect.next = fiber;
      lastEffect = fiber;
    }
  }, level);

  return firstEffect;
};

/**
 * 处理修改内容
 * @param {Fiber} fiber
 */
const TCommit = (fiber) => {
  while (fiber != null) {
    const { type, flags } = fiber;

    // 如果要添加
    if (flags.append && fiber.dom) {
      const parDom = getParDom(fiber);
      if (parDom) parDom.appendChild(fiber.dom);
    }

    // 如果属性变化
    if (flags.attr && fiber.dom) {
      const attrs = fiber.vdom.props;
      for (var i in attrs) {
        if (['children'].includes(i)) continue;
        if (i.substr(0, 2) === 'on') {
          fiber.dom[i.toLocaleLowerCase()] = attrs[i];
        } else {
          fiber.dom.setAttribute(i.toLocaleLowerCase(), attrs[i]);
        }
      }
    }

    // 如果文本变化
    if (flags.text && fiber.dom) {
      fiber.dom.data = fiber.vdom;
    }

    // 如果重渲染
    if (flags.render) {
      RunFiberEffect(fiber);
    }

    fiber = fiber.next;
  }
};

/**
 * 获取最近的上级dom
 * @param {Fiber} fiber
 */
const getParDom = (fiber) => {
  fiber = fiber.return;
  while (fiber != null) {
    if (fiber.dom) {
      return fiber.dom;
    }
    fiber = fiber.return;
  }
};

/**
 * 创建一个局部变量
 * @param {*|()=>*} def 默认值
 */
export const useState = (def) => {
  const fiber = moduleFiber;
  if (moduleFiber == null) throw new Error('只能在组件渲染中使用 setState');
  /** 读取当前存储的值 */
  let item = moduleFiber.hooks[hookIndex];
  // 如果是初始化
  if (item == null) {
    item = moduleFiber.hooks[hookIndex] = {
      type: 'state',
      value: (typeof def === 'function') ? def() : def
    };
  }

  hookIndex++;

  return [item.value, (val, level = 0) => {
    if (item.value === val && val != null) return;
    item.value = val;
    AddReRender(fiber, level);
  }];
};

/**
 * 进行一个副作用操作
 * @param {()=>{}} cb 副作用回调
 * @param {[]} ref 数据变化的参照物
 */
export const useEffect = (cb, ref) => {
  const fiber = moduleFiber;
  if (moduleFiber == null) throw new Error('只能在组件渲染中使用 useEffect');
  /** 读取当前存储的值 */
  let item = moduleFiber.hooks[hookIndex];
  // 如果是初始化
  if (item == null) {
    item = moduleFiber.hooks[hookIndex] = {
      type: 'effect',
      value: cb,
      needRun: true,
      ref: ref
    };
  }

  // 如果没有参照物或者参照物改变
  if (ref == null || !ArrayEqual(ref, item.ref)) {
    item.needRun = true;
  }
  item.ref = ref;

  hookIndex++;
};

/**
 * 创建一个指针遍历
 * @param {*} def 默认值
 * @returns
 */
export const useRef = (def) => {
  const [data] = useState(() => {
    if (typeof def === 'function') {
      def = def();
    }
    return { current: def };
  });
  return data;
};
