import { useState, useCallback, useMemo, useReducer } from "./react-dom";
import {
  REACT_CONTEXT,
  REACT_ELEMENT,
  REACT_FORWARD_REF,
  REACT_MEMO,
  REACT_PROVIDER,
} from "./constants";
import { Component } from "./component";
import { shallowEqual, wrapToVdom } from "./utils";

// element.props.children表示子元素
// 当没有子元素时，children为undefined
// 当只有一个子元素时，children为对象/字符串/数字
// 当有多个子元素时，children为数组
function createElement(type, config, children) {
  let key, ref;
  if (config) {
    key = config.key; // 用于DIFF算法
    ref = config.ref; // 引用真实DOM元素
    delete config.key;
    delete config.ref;
  }
  let props = { ...config };
  if (arguments.length > 3) {
    // 说明有多个子元素，则从第3个起后面的参数都为子元素
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
  } else if (arguments.length === 3) {
    // 说明只有一个子元素
    props.children = wrapToVdom(children);
  }
  return {
    $$typeof: REACT_ELEMENT, // 指的是元素类型
    type, // dom标签的类型 h1,h2……
    props, // className,style,children……
    ref,
    key,
  };
}

/**
 * 克隆组件
 * @param {*} element
 * @param {*} newProps
 * @param {*} newChildren
 * @return {*}
 */
function cloneElement(element, newProps, ...newChildren) {
  const oldChildren = element.props?.children;
  let children = [
    ...(Array.isArray(oldChildren) ? oldChildren : [oldChildren]),
    ...newChildren,
  ]
    .filter((item) => item !== undefined)
    .map(wrapToVdom);
  if (children.length === 1) children = children[0];
  const props = { ...element.props, ...newProps, children };
  return { ...element, props };
}

function createRef() {
  return {
    current: null,
  };
}

/**
 * @param {*} render 就是一个可以接收转发ref的函数组件
 * @return {*}
 */
function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render,
  };
}

/**
 * 新建上下文对象
 * @return {*}
 */
function createContext() {
  let context = { $$typeof: REACT_CONTEXT, _currentValue: undefined };
  context.Provider = {
    $$typeof: REACT_PROVIDER,
    _context: context,
  };
  context.Consumer = {
    $$typeof: REACT_CONTEXT,
    _context: context,
  };
  return context;
}

class PureComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState)
    );
  }
}

/**
 *
 * @param {*} type 函数组件
 * @param {*} compare 比较方法，用于比较新旧属性的差异
 */
function memo(type, compare = shallowEqual) {
  return {
    $$typeof: REACT_MEMO,
    compare,
    type,
  };
}

const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
  createContext,
  cloneElement,
  PureComponent,
  memo,
  useState,
  useCallback,
  useMemo,
  useReducer,
};
export default React;
