import { computed } from '../computed';
import { reactive } from '../reactive';
describe('computed', () => {
  it('should work', () => {
    const user = reactive({ age: 1 });
    const age = computed(() => {
      return user.age;
    });
    expect(age.value).toBe(1);
  });
  // test.skip('should unwrap computed refs', () => {
  //   // readonly
  //   const a = computed(() => 1);
  //   // writable
  //   const b = computed({
  //     get: () => 1,
  //     set: () => {},
  //   });
  //   const obj = reactive({ a, b });
  //   // check type
  //   obj.a + 1;
  //   obj.b + 1;
  //   expect(typeof obj.a).toBe(`number`);
  //   expect(typeof obj.b).toBe(`number`);
  // });
  // it.skip('should return updated value', () => {
  //   const value = reactive<{ foo?: number }>({});
  //   const cValue = computed(() => value.foo);
  //   expect(cValue.value).toBe(undefined);
  //   value.foo = 1;
  //   expect(cValue.value).toBe(1);
  // });

  it('should compute lazily', () => {
    const value = reactive({});
    const getter = jest.fn(() => value.foo);
    const cValue = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(undefined);
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute until needed
    value.foo = 1;
    expect(getter).toHaveBeenCalledTimes(1);

    // now it should compute
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
