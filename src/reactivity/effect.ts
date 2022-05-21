class ReactiveEffect {
  private _fn: any;
  constructor(fn: any, public scheduler?: any) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
}

export function effect(fn: any, options: any = {}) {
  // 生成一个依赖
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();
  return _effect.run.bind(_effect);
}

// 简易的实现，将当前reactive对象的依赖存在全局map中
const targetMap = new Map();
let activeEffect: any;

export function track(target: any, key: any) {
  // 一个reactive对象对应一个depsMap
  // 其中的每一个key都对应一个依赖dep
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);

  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  // 当前被获取的key添加一个依赖
  dep.add(activeEffect);
}

export function trigger(target: any, key: any) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else effect.run();
  }
}
