import { isReactive, isReadonly, shallowReadonly } from '../reactive';

describe('shallowReadonly', () => {
  test('should not make non-reactive properties reactive', () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReactive(props.n)).toBe(false);
    expect(isReadonly(props.n)).toBe(false);
  });
});
