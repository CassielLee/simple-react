import { compareTwoVdom, findDOM } from "./react-dom";

export const updateQueue = {
  isBatchUpdate: false, // 标志符，控制同步还是异步
  updaters: [], // 更新的书序
  batchUpdate() {
    // 执行批量更新
    updateQueue.updaters.forEach((updater) => updater.updateComponent());
    updateQueue.isBatchUpdate = false;
    updateQueue.updaters.length = 0;
  },
};

/**
 * 实现类组件
 * 函数组件和类组件都会在编译之后成为函数
 * 为了区分类组件和函数组件，给类组件添加一个静态属性isReactComponent=true，以此来进行区分
 * 子类继承父类不但会继承实例方法也会继承静态方法
 * @class Component
 */
class Component {
  static isReactComponent = true;
  constructor(props) {
    this.props = props;
    this.state = {};
    this.updater = new Updater(this);
  }
  // 更新状态，只传入要更改的状态即可
  setState(partialState) {
    this.updater.addState(partialState);
  }
  // 强行更新
  forceUpdate() {
    const oldRenderVdom = this.oldRenderVdom;
    const oldDom = findDOM(oldRenderVdom);
    const newRenderVdom = this.render();

    if (this.constructor.contextType) {
      this.context = this.constructor.contextType._currentValue;
    }
    // 实现getDerivedStateFromProps
    if (this.constructor.getDerivedStateFromProps) {
      const newState = this.constructor.getDerivedStateFromProps(
        this.props,
        this.state
      );
      if (newState) this.state = newState;
    }
    const snapshot =
      this.getSnapshotBeforeUpdate && this.getSnapshotBeforeUpdate();
    // DIFF算法比较虚拟dom
    compareTwoVdom(oldDom.parentNode, oldRenderVdom, newRenderVdom);
    // 更新旧的虚拟dom用于后续更新的比较
    this.oldRenderVdom = newRenderVdom;
    // 更新完之后调用生命周期方法
    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state, snapshot);
    }
  }
}

class Updater {
  constructor(classComponentInstance) {
    this.classComponentInstance = classComponentInstance;
    // 更新队列
    this.penddingStates = [];
  }

  addState(partialState) {
    this.penddingStates.push(partialState);
    // 触发组件更新
    this.emitUpdate();
  }

  emitUpdate(newProps) {
    this.nextProps = newProps;
    if (updateQueue.isBatchUpdate) {
      // 如果是批量更新  代表是异步，先将更新实例存起来
      updateQueue.updaters.push(this);
    } else {
      this.updateComponent();
    }
  }

  // 更新组件
  updateComponent() {
    const { classComponentInstance, penddingStates, nextProps } = this;
    // 如果属性更新或者是状态更新，都会触发更新逻辑
    if (nextProps || penddingStates.length) {
      shouldComponentUpdate(classComponentInstance, nextProps, this.getState());
    }
  }

  // 基于旧状态和penddingStates计算新状态
  getState() {
    const { classComponentInstance, penddingStates } = this;
    // 获取旧state状态
    let { state } = classComponentInstance;
    // 计算新state状态
    penddingStates.forEach((nextState) => {
      // setState传入可以是一个对象也可以是函数，例如：setSate((state)=>({number:state.number+1}))
      if (typeof nextState === "function") {
        nextState = nextState(state);
      }
      state = { ...state, ...nextState };
    });
    // 清空penddingStates数组
    penddingStates.length = 0;
    return state;
  }
}

/**
 * 生命周期函数  判断组件是否要更新
 * @param {*} classComponentInstance 类组件实例
 * @param {*} nextState 新的state
 */
function shouldComponentUpdate(classComponentInstance, nextProps, nextState) {
  let willUpdate = true;
  // 判断组件实例中是否定义了shouldComponentUpdate方法，如果定义了，则当该函数返回false是不更新组件
  if (
    classComponentInstance.shouldComponentUpdate &&
    !classComponentInstance.shouldComponentUpdate(nextProps, nextState)
  ) {
    willUpdate = false;
  }
  if (willUpdate && classComponentInstance.componentWillUpdate) {
    classComponentInstance.componentWillUpdate();
  }
  // 更新组件的props
  if (nextProps) classComponentInstance.props = nextProps;
  // 不管是否更新页面，state都会更新
  classComponentInstance.state = nextState;
  if (willUpdate) {
    classComponentInstance.forceUpdate();
  }
}

export { Component };
