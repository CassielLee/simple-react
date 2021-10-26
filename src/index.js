import React from "./react";
import ReactDOM from "./react-dom";

// // const reactEl = React.createElement(
// //   "h1",
// //   {
// //     className: "title",
// //     style: {
// //       color: "red",
// //     },
// //   },
// //   "hello world",
// //   React.createElement(
// //     "span",
// //     {
// //       style: {
// //         color: "blue",
// //       },
// //     },
// //     "HHHHHHHHHH"
// //   )
// // );
// // console.log("reactEl: ", reactEl);
// // const FunctionComp = (props) => {
// //   return (
// //     <div className="title" style={{ color: "red" }}>
// //       hello,{props.name}
// //       <h1>children</h1>
// //     </div>
// //   );
// //   return React.createElement(
// //     "div",
// //     {
// //       className: "title",
// //       style: {
// //         color: "green",
// //       },
// //       ...props,
// //     },
// //     `hello,${props.name}`
// //   );
// // };
// // const reactEl = <FunctionComp name="someone" />;
// // class ClassComp extends React.Component {
// //   constructor(props) {
// //     super(props);
// //   }
// //   render() {
// //     return (
// //       <div className="title" style={{ color: "red" }}>
// //         hello,world!
// //         <h1 style={{ color: "skyblue" }}>this is class component</h1>
// //       </div>
// //     );
// //   }
// // }

// class Counter extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { number: 0 };
//   }

//   handleClick = (event) => {
//     console.log("点击点击");
//     event.stopPropagation();
//     this.setState({
//       number: this.state.number + 1,
//     });
//     console.log("this.state.number: ", this.state.number);
//     this.setState({
//       number: this.state.number + 1,
//     });
//     console.log("this.state.number: ", this.state.number);
//     setTimeout(() => {
//       this.setState({
//         number: this.state.number + 1,
//       });
//       console.log("this.state.number: ", this.state.number);
//       this.setState({
//         number: this.state.number + 1,
//       });
//       console.log("this.state.number: ", this.state.number);
//     });
//   };

//   testPrevent(event) {
//     event.preventDefault();
//   }

//   render() {
//     return (
//       <div
//         className="title"
//         style={{ color: "skyblue" }}
//         onClick={() => console.log("冒泡冒泡")}
//       >
//         <h1>{this.state.number}</h1>
//         <button onClick={this.handleClick}>+</button>
//         {/* <a href="#" onClick={this.testPrevent}>
//           阻止默认事件
//         </a> */}
//       </div>
//     );
//   }
// }

// forwardRef实现测试
// class Sum extends React.Component {
//   constructor(props) {
//     super(props);
//     this.a = React.createRef();
//     this.b = React.createRef();
//     this.res = React.createRef();
//   }

//   handleAdd = () => {
//     this.res.current.value = this.a.current.value + this.b.current.value;
//   };

//   render() {
//     return (
//       <div>
//         <input ref={this.a} />+<input ref={this.b} />
//         <button onClick={this.handleAdd}>=</button>
//         <input ref={this.res} />
//       </div>
//     );
//   }
// }

// const reactEl = <Sum />;
// console.log("reactEl: ", reactEl);
// ReactDOM.render(reactEl, document.getElementById("root"));

// 组件生命周期实现
// class Counter extends React.Component {
//   // 他会比较两个状态相等就不会刷新视图 PureComponent是浅比较
//   static defaultProps = {
//     name: "珠峰架构",
//   };
//   constructor(props) {
//     super(props);
//     this.state = { number: 0 };
//     console.log("Counter 1.constructor");
//   }
//   componentWillMount() {
//     // 取本地的数据 同步的方式：采用渲染之前获取数据，只渲染一次
//     console.log("Counter 2.componentWillMount");
//   }
//   componentDidMount() {
//     console.log("Counter 4.componentDidMount");
//   }
//   handleClick = () => {
//     this.setState({ number: this.state.number + 1 });
//   };
//   // react可以shouldComponentUpdate方法中优化 PureComponent 可以帮我们做这件事
//   shouldComponentUpdate(nextProps, nextState) {
//     // 代表的是下一次的属性 和 下一次的状态
//     console.log("Counter 5.shouldComponentUpdate");
//     return nextState.number % 2 === 0;
//     // return nextState.number!==this.state.number; //如果此函数种返回了false 就不会调用render方法了
//   } //不要随便用setState 可能会死循环
//   componentWillUpdate() {
//     console.log("Counter 6.componentWillUpdate");
//   }
//   componentDidUpdate() {
//     console.log("Counter 7.componentDidUpdate");
//   }
//   render() {
//     console.log("Counter 3.render");
//     return (
//       <div>
//         <p>{this.state.number}</p>
//         {this.state.number === 4 ? null : (
//           <ChildCounter count={this.state.number} />
//         )}
//         <button onClick={this.handleClick}>+</button>
//       </div>
//     );
//   }
// }
// class ChildCounter extends React.Component {
//   componentWillUnmount() {
//     console.log(" ChildCounter 6.componentWillUnmount");
//   }
//   componentWillMount() {
//     console.log("ChildCounter 1.componentWillMount");
//   }
//   render() {
//     console.log("ChildCounter 2.render");
//     return <div>{this.props.count}</div>;
//   }
//   componentDidMount() {
//     console.log("ChildCounter 3.componentDidMount");
//   }
//   componentWillReceiveProps(newProps) {
//     // 第一次不会执行，之后属性更新时才会执行
//     console.log("ChildCounter 4.componentWillReceiveProps");
//   }
//   shouldComponentUpdate(nextProps, nextState) {
//     console.log("ChildCounter 5.shouldComponentUpdate");
//     return nextProps.count % 3 === 0; //子组件判断接收的属性 是否满足更新条件 为true则更新
//   }
// }
// ReactDOM.render(<Counter />, document.getElementById("root"));

// DOM-DIFF算法
// class Counter extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       list: ["A", "B", "C", "D", "E", "F"],
//     };
//   }
//   handleClick = () => {
//     this.setState({
//       list: ["A", "C", "E", "B", "G"],
//     });
//   };
//   render() {
//     return (
//       <div>
//         <ul>
//           {this.state.list.map((item) => (
//             <li key={item}>{item}</li>
//           ))}
//         </ul>
//         <button onClick={this.handleClick}>+</button>
//       </div>
//     );
//   }
// }
// ReactDOM.render(<Counter />, document.getElementById("root"));

// 属性代理
// const loading = (message) => (OldComponent) => {
//   return class extends React.Component {
//     render() {
//       const state = {
//         show: () => {
//           let div = document.createElement("div");
//           div.innerHTML = `<p id="loading" style="position:absolute;top:100px;z-index:10;color:black">${message}</p>`;
//           document.body.appendChild(div);
//         },
//         hide: () => {
//           document.getElementById("loading").remove();
//         },
//       };
//       return (
//         <OldComponent
//           {...this.props}
//           {...state}
//           {...{ ...this.props, ...state }}
//         />
//       );
//     }
//   };
// };

// @loading("正在加载中")
// @loading("test")
// class Hello extends React.Component {
//   render() {
//     console.log(this.props);
//     return (
//       <div>
//         hello<button onClick={this.props.show}>show</button>
//         <button onClick={this.props.hide}>hide</button>
//       </div>
//     );
//   }
// }

// // let LoadingHello = loading(Hello);

// ReactDOM.render(<Hello />, document.getElementById("root"));

// class Button extends React.Component {
//   state = { name: "张三" };
//   componentWillMount() {
//     console.log("Button componentWillMount");
//   }
//   componentDidMount() {
//     console.log("Button componentDidMount");
//   }
//   render() {
//     console.log("Button render");
//     return <button name={this.state.name} title={this.props.title} />;
//   }
// }
// const wrapper = (OldComponent) => {
//   return class NewComponent extends OldComponent {
//     state = { number: 0 };
//     componentWillMount() {
//       console.log("WrapperButton componentWillMount");
//       super.componentWillMount();
//     }
//     componentDidMount() {
//       console.log("WrapperButton componentDidMount");
//       super.componentDidMount();
//     }
//     handleClick = () => {
//       this.setState({ number: this.state.number + 1 });
//     };
//     render() {
//       console.log("WrapperButton render");
//       let renderElement = super.render();
//       let newProps = {
//         ...renderElement.props,
//         ...this.state,
//         onClick: this.handleClick,
//       };
//       return React.cloneElement(renderElement, newProps, this.state.number);
//     }
//   };
// };
// let WrappedButton = wrapper(Button);
// ReactDOM.render(
//   <WrappedButton title="标题" />,
//   document.getElementById("root")
// );

// class ClassCounter extends React.PureComponent {
//   render() {
//     return <div>ClassCounter:{this.props.count}</div>;
//   }
// }
// function FunctionCounter(props) {
//   console.log("FunctionCounter render");
//   return <div>FunctionCounter:{props.count}</div>;
// }
// const MemoFunctionCounter = React.memo(FunctionCounter);
// class App extends React.Component {
//   state = { number: 0 };
//   amountRef = React.createRef();
//   handleClick = () => {
//     let nextNumber = this.state.number + parseInt(this.amountRef.current.value);
//     this.setState({ number: nextNumber });
//   };
//   render() {
//     return (
//       <div>
//         <ClassCounter count={this.state.number} />
//         <MemoFunctionCounter count={this.state.number} />
//         <input ref={this.amountRef} defaultValue={0} />
//         <button onClick={this.handleClick}>+</button>
//       </div>
//     );
//   }
// }
// ReactDOM.render(<App />, document.getElementById("root"));

// class Dialog extends React.Component {
//   constructor(props) {
//     super(props);
//     this.node = document.createElement("div");
//     document.body.appendChild(this.node);
//   }
//   render() {
//     return ReactDOM.createPortal(
//       <div className="dialog">{this.props.children}</div>,
//       this.node
//     );
//   }
//   componentWillUnmount() {
//     window.document.body.removeChild(this.node);
//   }
// }
// class App extends React.Component {
//   render() {
//     return (
//       <div>
//         <Dialog>模态窗</Dialog>
//       </div>
//     );
//   }
// }
// ReactDOM.render(<App />, document.getElementById("root"));

// useState测试
// const Counter = () => {
//   const [count, setCount] = React.useState(0);
//   return (
//     <div>
//       <p>数字：{count}</p>
//       <button onClick={() => setCount(count + 1)}>+</button>
//     </div>
//   );
// };

// useCallback&useMemo
// const Child = ({ data, handleClick }) => {
//   console.log("Child render");
//   return <button onClick={handleClick}>{data.number}</button>;
// };
// const MemoChild = React.memo(Child);

// const App = () => {
//   console.log("App render");
//   const [name, setName] = React.useState("zhufeng");
//   const [number, setNumber] = React.useState(0);
//   const data = React.useMemo(() => ({ number }));
//   const handleClick = React.useCallback(() => setNumber(number), [number]);
//   return (
//     <div>
//       <input
//         type="text"
//         value={name}
//         onChange={(event) => setName(event.target.value)}
//       />
//       <MemoChild data={data} handleClick={handleClick} />
//     </div>
//   );
// };

// const reducer = (state = { number: 0 }, action) => {
//   switch (action.type) {
//     case "ADD":
//       return { number: state.number + 1 };
//     case "MINUS":
//       return { number: state.number - 1 };
//     default:
//       return state;
//   }
// };

// function App() {
//   const [state, dispatch] = React.useReducer(reducer, { number: 0 });
//   return (
//     <div>
//       Count: {state.number}
//       <button onClick={() => dispatch({ type: "ADD" })}>+</button>
//       <button onClick={() => dispatch({ type: "MINUS" })}>-</button>
//     </div>
//   );
// }

// ReactDOM.render(<App />, document.getElementById("root"));

function Counter() {
  const [number, setNumber] = React.useState(0);
  React.useEffect(() => {
    console.log("开启一个新的定时器");
    const $timer = setInterval(() => {
      setNumber((number) => number + 1);
    }, 1000);
    return () => {
      console.log("销毁老的定时器");
      clearInterval($timer);
    };
  }, []);
  return <p>{number}</p>;
}
ReactDOM.render(<Counter />, document.getElementById("root"));
