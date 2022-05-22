import { extend } from '../shared';

class ReactiveEffect {
  private _fn: any;
  effect: any;
  deps = []; // dep相当于是该依赖的父级
  active = true;
  onStop?: () => void;
  constructor(fn: any, public scheduler?: any) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    return this._fn();
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) this.onStop();
      this.active = false;
    }
  }
}

function cleanupEffect(effect: any) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
}

export function effect(fn: any, options: any = {}) {
  // 生成一个依赖
  const _effect: any = new ReactiveEffect(fn, options.scheduler);
  extend(_effect, options);
  _effect.run();

  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect; // 这一步，是为了能直接通过runner找到依赖本身
  return runner;
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
  if (!activeEffect) return;
  // 当前被获取的key添加一个依赖
  dep.add(activeEffect);
  // dep在这里相当于activeEffect的父级，后面需要通过父级来删除子级实现删除
  activeEffect.deps.push(dep);
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

export function stop(runner: any) {
  // 直接通过runner上的effect触发依赖本身的stop
  runner.effect.stop();
}
