import { reactive, isReactive } from '../reactive';

describe('isReactive', () => {
  it('should work', () => {
    const original = {
      a: 1,
    };
    const observer = reactive(original);

    const flag1 = isReactive(observer);
    expect(flag1).toBe(true);
    const flag2 = isReactive(original);
    expect(flag2).toBe(false);
  });
});
