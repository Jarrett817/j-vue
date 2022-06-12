import { extend, isObject } from '../shared';
import { track, trigger } from './effect';
import { ReactiveFlags, reactive, readonly } from './reactive';

const get = createGetter();
const set = createSetter();

const readonlyGet = createGetter(true);

const shallowReadonlyGet = createGetter(true, true);

/* 使用 Proxy 的一个难点是 this 绑定。我们希望任何方法都绑定到这个 Proxy，而不是目标对象，
这样我们也可以拦截它们。值得庆幸的是，ES6 引入了另一个名为 Reflect 的新特性，
它允许我们以最小的代价消除了这个问题
*/
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: any, key: string) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key == ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);
    if (shallow) return res;
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    !isReadonly && track(target, key);
    return res;
  };
}

function createSetter() {
  return function set(target: any, key: string, value: any) {
    const res = Reflect.set(target, key, value);
    // 触发依赖
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target: any, key: string, value: any) {
    console.warn(`key:${key}set失败，因为 target 是 readonly`, target);
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyGet, {
  get: shallowReadonlyGet,
});
