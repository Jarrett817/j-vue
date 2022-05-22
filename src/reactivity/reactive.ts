import { mutableHandlers, readonlyHandlers } from './baseHandlers';

interface ReactiveRaw {
  [key: string | number | symbol]: any;
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
