import { reactive, isReactive, readonly, isProxy } from '../reactive';

describe('reactive', () => {
  it('should work', () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
  });

  it('should work with nested reactive', () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = reactive(original);
    expect(isReactive(wrapped.bar)).toBe(true);
  });

  it('should work with isProxy', () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped1 = reactive(original);
    const wrapped2 = readonly(original);
    expect(isProxy(wrapped1.bar)).toBe(true);
    expect(isProxy(wrapped2.bar)).toBe(true);
    expect(isProxy(wrapped1)).toBe(true);
    expect(isProxy(wrapped2)).toBe(true);
  });
});
