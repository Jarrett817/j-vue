import { hasChanged } from '../shared';
import { triggerEffects, trackEffects, isTracking } from './effect';
import { isObject } from '../shared/index';
import { reactive } from './reactive';
class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  public __v_isRef = true;
  constructor(value: any) {
    this._rawValue = value;
    this._value = convert(value);
    this.dep = new Set();
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is
    // Object.is不会做强制的类型转换，并且区分Number.NaN和NaN,-0和+0，是更准确的对比
    if (!hasChanged(newValue, this._rawValue)) return;
    this._rawValue = newValue;
    this._value = convert(newValue);
    triggerEffects(this.dep);
  }
}

function convert(value: any) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref: any) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}

export function ref(value: any) {
  return new RefImpl(value);
}

export function isRef(ref: any) {
  return !!ref.__v_isRef;
}

export function unref(ref: any) {
  return isRef(ref) ? ref.value : ref;
}
