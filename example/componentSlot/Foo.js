import { h, renderSlots } from '../../lib/guide-j-vue.ems.js';

export const Foo = {
  setup() {},
  render() {
    console.log('slots', this.$slots);
    return h('div', {}, [
      renderSlots(this.$slots, 'header', { age: 10 }),
      renderSlots(this.$slots, 'footer'),
    ]);
  },
};
