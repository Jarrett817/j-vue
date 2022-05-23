import { ReactiveEffect } from './effect';
class ComputedRef {
  private _dirty: boolean = true;
  private _value: any;
  private _effect: any;
  constructor(getter: () => any) {
    // 这里传递scheduler，将会在trigger时只执行scheduler，这里将dirty重置为true，是为了能够在变动后重新compute
    // new 一个依赖，但是不立即执行fn，等到get时候再执行fn
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }

  get value() {
    if (this._dirty) {
      this._dirty = false;
      // 只在执行get时才去run
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter: () => any) {
  return new ComputedRef(getter);
}
