import { reactive, isReactive } from '../reactive';

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
});
