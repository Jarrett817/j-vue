import { track, trigger } from './effect';

interface ReactiveRaw {
  [key: string | number | symbol]: any;
}

// 观察者模式，收集依赖至effect，set时逐个遍历触发
export function reactive(raw: ReactiveRaw) {
  return new Proxy(raw, {
    get(target, key) {
      /* https://www.zhangxinxu.com/wordpress/2021/07/js-proxy-reflect/
       使用reflect的原因参考张鑫旭的文章
       */
      // 收集依赖
      const res = Reflect.get(target, key);
      track(target, key);
      return res;
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value);

      // 触发依赖
      trigger(target, key);
      return res;
    },
  });
}
