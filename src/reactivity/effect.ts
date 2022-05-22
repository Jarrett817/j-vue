import { extend } from '../shared';

let shouldTrack = false;
let activeEffect: any;

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
    if (!this.active) return this._fn();
    shouldTrack = true;
    activeEffect = this;
    // 在执行this.fn的时候，fn里所用到的reactive变量，会将本对象作为依赖收集
    const result = this._fn();
    // 已经收集好依赖了，将shouldTrack置为false，表明在这个fn中所用到的reactive变量都已完成依赖收集
    // 不会再有另外的reactive变量以此为依赖了，因此关闭掉
    shouldTrack = false;
    return result;
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) this.onStop();
      this.active = false;
      shouldTrack = false;
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

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trackEffects(dep: any) {
  // 当前被获取的key添加一个依赖
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  // dep在这里相当于activeEffect的父级，后面需要通过父级来删除子级实现删除
  activeEffect.deps.push(dep);
}

export function track(target: any, key: any) {
  if (!isTracking()) return;
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
  trackEffects(dep);
}

export function triggerEffects(dep: any) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else effect.run();
  }
}

export function trigger(target: any, key: any) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  triggerEffects(dep);
}

export function stop(runner: any) {
  // 直接通过runner上的effect触发依赖本身的stop
  runner.effect.stop();
}
