import { effect } from '../effect';
import { reactive } from '../reactive';

describe('effect', () => {
  it.skip('should work', () => {
    const user = reactive({ age: 10 });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    user.age++;
    expect(nextAge).toBe(12);
  });

  it.skip('should work', () => {
    const user = reactive({ a: 10, b: 11 });
    let aCount: number = 0;
    let bCount: number = 0;
    effect(() => {
      user.a;
      aCount++;
    });

    effect(() => {
      user.b;
      bCount++;
    });
    // TODO，有漏洞，共享一个activeEffect，导致直接user.a的时候触发了trigger，把上一个activeEffect也加进了依赖
    user.a = user.a + 1;
    expect(aCount).toBe(2);
    expect(bCount).toBe(1);
  });

  it('should return runner when call effect', () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return 'foo';
    });

    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe('foo');
  });
});
