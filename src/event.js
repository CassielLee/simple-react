import { updateQueue } from "./component";

/**
 * 增加事件
 * @param {*} dom 绑定事件的DOM元素
 * @param {*} eventType 绑定事件的类型
 * @param {*} handler 绑定事件的处理函数
 */
export function addEvent(dom, eventType, handler) {
  //TODO
  //  保证dom有store属性，值初始化为一个空对象，是一个自定义属性
  let store;
  if (dom.store) {
    store = dom.store;
  } else {
    store = dom.store = {};
  }
  store[eventType] = handler;
  // 虽然没有直接将绑定事件绑定在DOM元素上，但是绑定事件的处理函数还是保存在DOM上
  //  从react 17开始 ，不再把事件委托给document，而是委托给容器，div#root
  if (!document[eventType]) {
    document[eventType] = dispatchEvent;
  }
}

// 合成事件的统一代理函数
function dispatchEvent(event) {
  let { target, type } = event;
  const eventType = `on${type}`;
  let syntheticEvent = createSyntheticEvent(event);
  updateQueue.isBatchUpdate = true;

  //  模拟事件冒泡
  while (target) {
    const { store } = target;
    const handler = store && store[eventType];
    handler && handler(syntheticEvent);
    // 这里需要判断是否阻止冒泡，如果阻止就退出循环，注意这里不能用return，如果用return则循环后面的代码也不会执行了
    if (syntheticEvent.isPropagationStopped) break;
    // 向上冒泡
    target = target.parentNode;
  }

  // 只有将isBatchUpdate置为false之后才会触发组件更新，不然只会将事件处理函数保存到更新队列里面
  updateQueue.isBatchUpdate = false;
  updateQueue.batchUpdate();
}

/**
 * 生成合成事件对象
 * 为什么不直接将原生事件对象直接传给事件处理函数？
 * 1. 兼容性
 * @param {*} nativeEvent 原生事件处理的对象
 */
function createSyntheticEvent(nativeEvent) {
  let syntheticEvent = {};
  for (const key in nativeEvent) {
    syntheticEvent[key] = nativeEvent[key];
  }
  syntheticEvent.nativeEvent = nativeEvent;
  syntheticEvent.preventDefault = preventDefault;
  syntheticEvent.isDefaultPrevented = false;
  syntheticEvent.stopPropagation = stopPropagation;
  syntheticEvent.isPropagationStopped = false;

  return syntheticEvent;
}

/**
 * 阻止默认事件
 * @param {*} event 原生事件对象
 */
function preventDefault() {
  const event = this.nativeEvent;
  if (!event) {
    // 兼容IE
    window.event.returnValue = false;
  }
  if (event.preventDefault) {
    event.preventDefault();
  }
  this.isDefaultPrevented = true;
}

function stopPropagation() {
  // 取到原生事件
  const event = this.nativeEvent;
  if (event.stopPropagation) {
    event.stopPropagation();
  } else {
    event.cancelBubble = true;
  }
  // 上述代码只是阻止原生的冒泡，实际上并不能阻止冒泡
  // 所以需要在合成事件上加一个自定义属性
  // this表示合成事件
  this.isPropagationStopped = true;
}
