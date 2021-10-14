import {
  MOVE,
  PLACEMENT,
  REACT_CONTEXT,
  REACT_FORWARD_REF,
  REACT_MEMO,
  REACT_PROVIDER,
  REACT_TEXT,
} from "./constants";
import { addEvent } from "./event";

// 记录hook状态
const hookState = [];
// 记录
let hookIndex = 0;
// 协调更新
let sheduleUpdate;

/**
 * @param {*} vdom 虚拟DOM 也就是React元素
 * @param {*} container 真实DOM容器
 */
function render(vdom, container) {
  mount(vdom, container);
  // 每次更新都是从根节点开始进行递归
  sheduleUpdate = () => {
    hookIndex = 0;
    compareTwoVdom(container, vdom, vdom);
  };
}

function mount(vdom, parentDOM) {
  // 将虚拟DOM变成真实DOM
  let newDOM = createDOM(vdom);
  // 将真实DOM添加到容器中
  if (newDOM) {
    parentDOM.appendChild(newDOM);
    // 此时挂载DOM完毕，触发componentDidMount函数调用
    if (newDOM.componentDidMount) newDOM.componentDidMount();
  }
}

/**
 * 把虚拟DOM变成真实DOM
 * @param {*} vdom 虚拟DOM
 * @return 真实DOM
 */
function createDOM(vdom) {
  if (!vdom) return null;
  const { type, props, ref } = vdom;
  let dom; // 真实DOM

  if (type?.$$typeof === REACT_MEMO) {
    return mountMemoComponent(vdom);
  }
  if (type?.$$typeof === REACT_PROVIDER) {
    return mountProviderComponent(vdom);
  }
  if (type?.$$typeof === REACT_CONTEXT) {
    return mountContextComponent(vdom);
  }
  // 处理转发ref组件
  if (type?.$$typeof === REACT_FORWARD_REF) {
    return mountForwardComponent(vdom);
  }
  // 当前虚拟DOM为文本节点
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props.content);
  } else if (typeof type === "function") {
    // 处理函数组件
    // 此处需要区分是类组件还是函数组件
    if (type.isReactComponent) {
      // 说明是类组件
      return mountClassComponent(vdom);
    }
    return mountFunctionComponent(vdom);
  } else if (typeof type === "string") {
    // 处理原生组件
    dom = document.createElement(type);
  }
  if (props) {
    // 更新DOM属性
    updateProps(dom, {}, props);
    let children = props.children;
    // 如果children是一个对象，则需要render children
    if (typeof children === "object" && children.type) {
      props.children.mountIndex = 0;
      mount(children, dom);
    } else if (Array.isArray(children)) {
      reconcileChildren(children, dom);
    }
  }
  // 在虚拟DOM上挂在一个dom属性将其指向其真实DOM
  vdom.dom = dom;
  if (ref) ref.current = dom;
  return dom;
}

function mountMemoComponent(vdom) {
  const { type, props } = vdom;
  // vdom中的type是createElement函数的第一个参数，即MemoComponent，也就是React.memo返回的对象，其结构为{$$typeof:REACT_MEMO,compare:Funtion,type:FunctionComponent}
  // 因为用type.type来得到要渲染的虚拟dom
  const renderVdom = type.type(props);
  // 记录旧的属性，方便更新的时候进行对比
  vdom.prevProps = props;
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}

/**
 * 挂载Provider组件
 * @param {*} vdom
 * @return {*}
 */
function mountProviderComponent(vdom) {
  const { type, props } = vdom;
  const context = type._context;
  context._currentValue = props.value;
  // 对Provider而言，要渲染的其实是他的儿子
  const renderVdom = props.children;
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}

/**
 * 挂载Context组件
 * @param {*} vdom
 * @return {*}
 */
function mountContextComponent(vdom) {
  const { type, props } = vdom;
  const context = type._context;
  const renderVdom = props.children(context._currentValue);
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}

/**
 * 挂载转发组件
 * @param {*} vdom {type:{$$typeof:REACT_FORWARD_REF,render},ref}
 */
function mountForwardComponent(vdom) {
  let { type, props, ref } = vdom;
  let renderVdom = type.render(props, ref);
  return createDOM(renderVdom);
}

/**
 * 挂载类组件
 * @param {*} vdom
 */
function mountClassComponent(vdom) {
  const { type: ClassComponent, props, ref } = vdom;
  // 创建类组件实例
  let classComponentInstance = new ClassComponent(props);
  if (ClassComponent.contextType) {
    classComponentInstance.context = ClassComponent.contextType._currentValue;
  }
  // 挂载类组件实例，用于后续生命周期函数调用
  vdom.classComponentInstance = classComponentInstance;
  // 更新ref属性
  if (ref) ref.current = classComponentInstance;
  // 调用生命周期函数
  if (classComponentInstance.componentWillMount) {
    classComponentInstance.componentWillMount();
  }
  // 调用类组件上的render方法，得到返回(可能是原生组件，也可能还是自定义组件)
  const renderVdom = classComponentInstance.render();
  //  将类实例与虚拟dom关联起来用于后续更新等操作
  vdom.oldRenderVdom = classComponentInstance.oldRenderVdom = renderVdom;
  let realDom = createDOM(renderVdom);
  // 调用生命周期函数
  if (classComponentInstance.componentDidMount) {
    realDom.componentDidMount = classComponentInstance.componentDidMount.bind(
      classComponentInstance
    );
  }
  return realDom;
}

/**
 * 挂在函数组件，此时type为函数
 * @param {*} vdom
 */
function mountFunctionComponent(vdom) {
  const { type: FunctionComponent, props } = vdom;
  // 执行函数组件得到函数组件的返回
  const renderVdom = FunctionComponent(props);
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}

function reconcileChildren(children, parentDOM) {
  children.forEach((childVdom, index) => {
    // 记录虚拟DOM索引用于后续DOM-DIFF
    childVdom.mountIndex = index;
    mount(childVdom, parentDOM);
  });
}

function updateProps(dom, oldProps, newProps) {
  for (const key in newProps) {
    if (key === "children") {
      continue;
    } else if (key === "style") {
      const styleObj = newProps[key];
      for (const attr in styleObj) {
        dom.style[attr] = styleObj[attr];
      }
    } else if (key.startsWith("on")) {
      // 处理绑定事件
      // dom[key.toLocaleLowerCase()] = newProps[key]; // TODO
      // 不直接绑定时间到对应的dom上，而是进行事件委托，全部委托到document上
      addEvent(dom, key.toLocaleLowerCase(), newProps[key]);
    } else {
      dom[key] = newProps[key];
    }
  }
  for (const key in oldProps) {
    // 如果某个属性在新的属性上没有，则需要删除
    if (!newProps.hasOwnProperty(key)) {
      dom[key] = null;
    }
  }
}

/**
 * 比较新的虚拟dom与旧的虚拟dom之间的区别并在更新到页面上
 * 思想：深度递归，找出新旧虚拟DOM的差异，并肩差异按最小化的操作同步到真实dom上，目的是尽可能复用dom结构
 * @param {*} parentDOM 真实父级dom
 * @param {*} oldVdom 旧虚拟dom
 * @param {*} newVdom 新虚拟dom
 * @param {*} nextDOM 新dom要插入的后一个节点的真实dom
 */
export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  // createDOM函数中将生成的真实dom赋值给了虚拟dom的dom属性上
  if (!oldVdom && !newVdom) {
    // 如果新和旧的vdom都是null,则什么都不用做
    return;
  } else if (oldVdom && !newVdom) {
    // 如果旧的vdom有，而newVdom为null，则要卸载旧节点
    unMountVdom(oldVdom);
  } else if (!oldVdom && newVdom) {
    // 如果旧vdom为null，而新dom不为null，则要插入新vdom
    mountVdom(parentDOM, newVdom, nextDOM);
  } else if (oldVdom && newVdom && oldVdom.type !== newVdom.type) {
    // 如果旧的和新的vdom都存在，则比较新旧vdom的type，如果type不一样则不能复用，需要卸载旧的dom并插入新的dom
    unMountVdom(oldVdom);
    mountVdom(parentDOM, newVdom, nextDOM);
  } else {
    // 如果旧的和新的vdom都存在，则比较新旧vdom的type，且type一样，则可以进行深度的dom-diff并且可以服用当前的DOM节点
    updateElement(oldVdom, newVdom);
  }
}

/**
 * 比较新旧vdom(dom-diff)
 * @param {*} oldVdom
 * @param {*} newVdom
 */
function updateElement(oldVdom, newVdom) {
  if (oldVdom.type.$$typeof === REACT_MEMO) {
    updateMemoComponent(oldVdom, newVdom);
  } else if (oldVdom.type.$$typeof === REACT_CONTEXT) {
    updateContextComponent(oldVdom, newVdom);
  } else if (oldVdom.type.$$typeof === REACT_PROVIDER) {
    updateProviderComponent(oldVdom, newVdom);
  } else if (oldVdom.type === REACT_TEXT && newVdom.type === REACT_TEXT) {
    // 如果都为文本节点
    // 可以复用旧的dom结构
    let currentDOM = (newVdom.dom = findDOM(oldVdom));
    // 更新dom节点的文本内容
    currentDOM.textContent = newVdom.props.content;
  } else if (typeof oldVdom.type === "string") {
    // 说明是原生组件
    let currentDOM = (newVdom.dom = findDOM(oldVdom));
    updateProps(currentDOM, oldVdom.props, newVdom.props);
    // 更新子节点
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
  } else if (typeof oldVdom.type === "function") {
    // 如果新旧节点的type都是function，则可能是函数组件或者是类组件(类组件和函数组件编译之后的type都是函数)
    if (oldVdom.type.isReactComponent) {
      // 如果是类组件，则先同步组件实例
      newVdom.classComponentInstance = oldVdom.classComponentInstance;
      updateClassComponent(oldVdom, newVdom);
    } else {
      // 函数组件
      updateFunctionComponent(oldVdom, newVdom);
    }
  }
}

/**
 * 更新MEMO组件
 * @param {*} oldVdom
 * @param {*} newVdom
 */
function updateMemoComponent(oldVdom, newVdom) {
  const { type, prevProps } = oldVdom;
  // 比较新旧props是否相同
  if (!type.compare(prevProps, newVdom.props)) {
    // console.log("prevProps: ", prevProps, newVdom.props);
    const parentDOM = findDOM(oldVdom).parentNode;
    const { type, props } = newVdom;
    const renderVdom = type.type(props);
    compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
    newVdom.prevProps = props;
    newVdom.oldRenderVdom = renderVdom;
  } else {
    // 跳过更新，更新属性值
    newVdom.prevProps = prevProps;
    newVdom.oldRenderVdom = oldVdom.oldRenderVdom;
  }
}

/**
 * 更新Context组件
 * @param {*} oldVdom
 * @param {*} newVdom
 */
function updateContextComponent(oldVdom, newVdom) {
  const parentDOM = findDOM(oldVdom).parentNode; // 旧DOM
  const { type, props } = newVdom;
  const context = type._context;
  const renderVdom = props.children(context._currentValue);
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
  newVdom.oldRenderVdom = renderVdom;
}

/**
 * 更新Provider组件
 * @param {*} oldVdom
 * @param {*} newVdom
 */
function updateProviderComponent(oldVdom, newVdom) {
  const parentDOM = findDOM(oldVdom).parentNode; // 旧DOM
  const { type, props } = newVdom;
  const context = type._context;
  context._currentValue = props.value; // 更新——currentValue值
  const renderVdom = props.children;
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
  newVdom.oldRenderVdom = renderVdom;
}

/**
 * 更新类组件
 * @param {*} oldVdom
 * @param {*} newVdom
 */
function updateClassComponent(oldVdom, newVdom) {
  // 复用旧的类组件实例
  const classComponentInstance = (newVdom.classComponentInstance =
    oldVdom.classComponentInstance);
  if (classComponentInstance.componentWillReceiveProps) {
    classComponentInstance.componentWillReceiveProps(newVdom.props);
  }
  classComponentInstance.updater.emitUpdate(newVdom.props);
}

/**
 * 更新函数组件
 * @param {*} oldVdom
 * @param {*} newVdom
 */
function updateFunctionComponent(oldVdom, newVdom) {
  // 获取旧真实DOM的父节点
  let parentDOM = findDOM(oldVdom).parentNode;
  // 函数组件更新每次都要执行函数得到新的虚拟DOM
  let { type, props } = newVdom;
  const newRenderVdom = type(props);
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, newRenderVdom);
  newVdom.oldRenderVdom = newRenderVdom;
}

/**
 * 更新子节点
 * @param {*} parentDOM
 * @param {*} oldVChildren
 * @param {*} newVChildren
 */
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  oldVChildren = Array.isArray(oldVChildren)
    ? oldVChildren
    : [oldVChildren].filter((child) => child);
  newVChildren = Array.isArray(newVChildren)
    ? newVChildren
    : [newVChildren].filter((child) => child);
  // let maxLength = Math.max(oldVChildren.length, newVChildren.length);
  // // 按照索引机械对比，不考虑移动的情况
  // for (let index = 0; index < maxLength; index++) {
  //   const nextVdom = oldVChildren.find(
  //     (item, i) => i > index && item && findDOM(item)
  //   );
  //   compareTwoVdom(
  //     parentDOM,
  //     oldVChildren[index],
  //     newVChildren[index],
  //     nextVdom && findDOM(nextVdom)
  //   );
  // }
  // 构建旧的子节点数组的map
  let keyedMap = {};
  oldVChildren.forEach((oldVChild, index) => {
    const oldKey = oldVChild.key ? oldVChild.key : index;
    keyedMap[oldKey] = oldVChild;
  });
  // 表示我们要打的补丁，也就是要进行的操作
  let patch = [];
  // 上一个放置好的索引，即上一个不用移动的元素索引
  let lastPlacedIndex = 0;
  // 循环新的子节点数组
  newVChildren.forEach((newVChild, index) => {
    newVChild.mountIndex = index;
    const newKey = newVChild.key ? newVChild.key : index;
    // 在旧节点map中查找newKey对应的节点
    const oldVChild = keyedMap[newKey];
    if (oldVChild) {
      // 如果旧节点存在，则表示可以复用旧节点
      // 先更新节点内容
      updateElement(oldVChild, newVChild);
      if (oldVChild.mountIndex < lastPlacedIndex) {
        // 则表示元素需要移动
        patch.push({
          type: MOVE,
          oldVChild, // 把oldVChild移动到新的索引处
          newVChild,
          mountIndex: index,
        });
      }
      // 删除已经复用的节点
      delete keyedMap[newKey];
      lastPlacedIndex = Math.max(lastPlacedIndex, oldVChild.mountIndex);
    } else {
      // 就节点不存在，则在新的索引处插入新节点
      patch.push({
        type: PLACEMENT,
        newVChild,
        mountIndex: index,
      });
    }
  });

  // 拿到需要移动的节点
  const moveChildren = patch
    .filter((action) => action.type === MOVE)
    .map((action) => action.oldVChild);

  // 此时keyedMap中剩下的元素就表示旧节点列表中存在而新节点列表中不存在的节点，即需要删除的节点
  // 删除需要移动和删除的元素
  Object.values(keyedMap)
    .concat(moveChildren)
    .forEach((oldVChild) => {
      const currentDOM = findDOM(oldVChild);
      parentDOM.removeChild(currentDOM);
      console.log("remove oldVChild: ", oldVChild);
    });

  // 打补丁包
  patch.forEach((action) => {
    const { type, oldVChild, newVChild, mountIndex } = action;
    // 旧的真实DOM节点
    let childNodes = parentDOM.childNodes;
    let newDOM;
    if (type === PLACEMENT) {
      // 根据虚拟DOM创建新的真实DOM
      newDOM = createDOM(newVChild);
    } else if (type === MOVE) {
      // 此时旧节点的内容已经更新，只需要将旧的dom移动到对应的位置即可
      newDOM = findDOM(oldVChild);
    }
    // 获取原来旧的DOM中对应的索引处的真实dom
    const childNode = childNodes[mountIndex];
    // 如果存在，则在旧的索引的节点前面插入新节点即可
    if (childNode) {
      parentDOM.insertBefore(newDOM, childNode);
    } else {
      // 如果不存在，则直接在子元素列表最后插入
      parentDOM.appendChild(newDOM);
    }
  });
}

/**
 * 挂载真实dom
 * @param {*} parentDOM  当前vdom的父级真实dom节点
 * @param {*} vdom  要挂载的vdom
 * @param {*} nextDOM  要挂载的dom节点的后一个节点
 */
function mountVdom(parentDOM, vdom, nextDOM) {
  let newDOM = createDOM(vdom);
  if (nextDOM) parentDOM.insertBefore(newDOM, nextDOM);
  else parentDOM.appendChild(newDOM);
  if (newDOM.componentDidMount) newDOM.componentDidMount();
}

/**
 * 根据vdom卸载对应的真实dom
 * @param {*} vdom 要卸载的vdom
 */
function unMountVdom(vdom) {
  let { props, ref } = vdom;
  // 获取旧的真实DOM
  let currentDOM = findDOM(vdom);
  // 如果当前节点为类组件，则需要执行类组件的生命周期函数componentWillUnmount
  if (
    vdom.classComponentInstance &&
    vdom.classComponentInstance.componentWillUnmount
  ) {
    vdom.classComponentInstance.componentWillUnmount();
  }
  if (ref) ref.current = null;
  // 处理子节点
  if (props.children) {
    let children = Array.isArray(props.children)
      ? props.children
      : [props.children];
    children.forEach(unMountVdom);
  }
  // 从父节点中删除
  if (currentDOM) currentDOM.parentNode.removeChild(currentDOM);
}

/**
 * 根据虚拟DOM找到对应的真实DOM(针对自定义组件嵌套)
 * @param {*} vdom 虚拟DOM对象
 * @return {*} 真实DOM
 */
export function findDOM(vdom) {
  if (!vdom) return null;
  // 如果有dom属性，则直接返回
  if (vdom.dom) return vdom.dom;
  return findDOM(vdom.oldRenderVdom);
}

/**
 * useState
 * @export
 * @param {*} initialState 初始化状态值
 * @return {*}
 */
export function useState(initialState) {
  // 查看hookState对应的位置是否有值，如果有表示更新，没有则是初始化
  hookState[hookIndex] = hookState[hookIndex]
    ? hookState[hookIndex]
    : initialState;
  const curIndex = hookIndex;
  const setState = (newState) => {
    // setState传入的参数可能是函数
    if (typeof newState === "function")
      newState = newState(hookState[curIndex]);
    // 更新hookState暂存的值
    hookState[curIndex] = newState;
    sheduleUpdate();
  };
  return [hookState[hookIndex++], setState];
}

/**
 * 实现useMemo
 * @export
 * @param {*} factory 工厂函数
 * @param {*} deps 依赖项
 * @return {*}
 */
export function useMemo(factory, deps) {
  // 更新
  if (hookState[hookIndex]) {
    if (deps?.length) {
      const [oldMemo, oldDeps] = hookState[hookIndex];
      const same =
        deps?.every((item, index) => item === oldDeps[index]) || false;
      if (same) {
        // 如果依赖没有改变
        hookIndex++;
        return oldMemo;
      }
    }
  }
  const newMemo = factory();
  hookState[hookIndex++] = [newMemo, deps];
  return newMemo;
}

export function useCallback(callback, deps) {
  if (hookState[hookIndex]) {
    if (deps?.length) {
      const [oldCallback, oldDeps] = hookState[hookIndex];
      const same =
        deps?.every((item, index) => item === oldDeps[index]) || false;
      if (same) {
        hookIndex++;
        return oldCallback;
      }
    }
  }
  hookState[hookIndex++] = [callback, deps];
  return callback;
}

/**
 * 实现useReducer
 * @param {*} reducer
 * @param {*} initialState
 * @returns
 */
export function useReducer(reducer, initialState) {
  hookState[hookIndex] = hookState[hookIndex] || initialState;
  const curIndex = hookIndex;
  const dispatch = (action) => {
    // 更新hookState暂存的值
    hookState[curIndex] = reducer
      ? reducer(hookState[curIndex], action)
      : action;
    sheduleUpdate();
  };
  return [hookState[hookIndex++], dispatch];
}

const ReactDOM = {
  render,
  createPortal: render,
};

export default ReactDOM;
