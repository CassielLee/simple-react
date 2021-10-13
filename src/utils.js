import { REACT_TEXT, REACT_ELEMENT } from "./constants";

/**
 * 为了更方便的进行虚拟DOM的比较，我们把虚拟DOM进行一下包装
 * 需要把字符串或者数字也变成一个对象
 */
export function wrapToVdom(elemet) {
  return typeof elemet === "string" || typeof elemet === "number"
    ? { $$typeof: REACT_ELEMENT, type: REACT_TEXT, props: { content: elemet } }
    : elemet;
}

/**
 * 浅比较两个对象
 * @export
 * @param {*} obj1
 * @param {*} obj2
 */
export function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  )
    return false;
  const key1 = Object.keys(obj1).filter((key) => !key.startsWith("__"));
  const key2 = Object.keys(obj2).filter((key) => !key.startsWith("__"));
  if (key1.length !== key2.length) return false;
  for (const key of key1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
}
