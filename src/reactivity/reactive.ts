import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from './baseHandlers';

interface ReactiveRaw {
  [key: string | number | symbol]: any;
}

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

function createActiveObject(raw: any, baseHandlers: any) {
  return new Proxy(raw, baseHandlers);
}

// 观察者模式，收集依赖至effect，set时逐个遍历触发
export function reactive(raw: ReactiveRaw) {
  return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw: ReactiveRaw) {
  return createActiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw: any) {
  return createActiveObject(raw, shallowReadonlyHandlers);
}

export function isReactive(value: any) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value: any) {
  return !!value[ReactiveFlags.IS_READONLY];
}
