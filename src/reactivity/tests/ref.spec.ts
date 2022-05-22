import { effect } from '../effect';
import { isRef, ref, unref, proxyRefs } from '../ref';

describe('ref', () => {
  it('should be reactive', () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    // same value should not trigger
    a.value = 2;
    expect(calls).toBe(2);
  });

  it('should make nested properties reactive', () => {
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });

  test('isRef', () => {
    expect(isRef(ref(1))).toBe(true);
    // expect(isRef(computed(() => 1))).toBe(true);

    expect(isRef(0)).toBe(false);
    expect(isRef(1)).toBe(false);
    // an object that looks like a ref isn't necessarily a ref
    expect(isRef({ value: 0 })).toBe(false);
  });

  test('unref', () => {
    expect(unref(1)).toBe(1);
    expect(unref(ref(1))).toBe(1);
  });

  test('ProxyRefs', () => {
    const obj = { a: ref(0), b: 1 };
    const _obj = proxyRefs(obj);
    expect(_obj.a).toBe(0);
    expect(_obj.b).toBe(1);

    _obj.b = ref(222);
    _obj.a = null;
    expect(_obj.b).toBe(222);
    expect(_obj.a).toBe(null);
  });
});
