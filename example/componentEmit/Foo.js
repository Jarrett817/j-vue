import { h } from '../../lib/guide-j-vue.ems.js';

export const Foo = {
  setup(props, { emit }) {
    console.log('props', props);
    const emitAdd = () => {
      console.log('emit add 触发');
      emit('add', 1, 2);
      emit('add-foo', 123);
    };
    return {
      emitAdd,
    };
  },
  render() {
    const btn = h('button', { onClick: this.emitAdd }, 'emitAdd');
    return h('h1', {}, ['foo: ' + this.count, btn]);
  },
};
