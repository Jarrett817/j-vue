import { createRenderer } from '../runtime-core';

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, preVal, nextVal) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextVal);
  } else {
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextVal);
    }
  }
}

function insert(el, parent) {
  parent.append(el);
}

export const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
});

// createApp作为一种render层面下的实现导出
export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from '../runtime-core/index';
