import { effect, stop } from '../effect';
import { reactive } from '../reactive';

describe('effect', () => {
  it('should work', () => {
    const user = reactive({ age: 10 });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    user.age++;
    expect(nextAge).toBe(12);
  });

  it('should work', () => {
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
    // 有漏洞，共享一个activeEffect，导致直接user.a的时候触发了trigger，把上一个activeEffect也加进了依赖
    // 需要在每次run后重置shouldTrack依赖，避免在执行如下代码时，将不需要的依赖收集进来
    user.a = user.a + 1;
    user.b = user.b + 1;
    expect(aCount).toBe(2);
    // expect(bCount).toBe(1);
    expect(bCount).toBe(2);
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

  it('scheduler', () => {
    // 定义一个Scheduler，
    // effect第一次执行，执行fn，
    // set，不执行fn，只执行scheduler
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // should not run yet
    expect(dummy).toBe(1);
    // manually run
    run();
    // should have run
    expect(dummy).toBe(2);
  });

  it('stop', () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    obj.prop++;
    expect(dummy).toBe(2);

    // stopped effect should still be manually callable
    runner();
    expect(dummy).toBe(3);
  });

  it('events: onStop', () => {
    const onStop = jest.fn();
    // stop时的回调函数
    const runner = effect(() => {}, {
      onStop,
    });

    stop(runner);
    expect(onStop).toHaveBeenCalled();
  });

  it('should observe nested properties', () => {
    let dummy;
    const counter = reactive({ nested: { num: 0 } });
    effect(() => (dummy = counter.nested.num));

    expect(dummy).toBe(0);
    counter.nested.num = 8;
    expect(dummy).toBe(8);
  });
});
