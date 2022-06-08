import { h } from '../../lib/guide-j-vue.ems.js';
import { Foo } from './Foo.js';

export const App = {
  name: 'App',
  render() {
    return h(
      Foo,
      {},
      {
        header: ({ age }) => h('h1', {}, '我将被渲染进插槽' + age),
        footer: () => h('h2', {}, '我是第二个元素'),
      }
    );
  },
  setup() {
    return {
      msg: 'vue',
    };
  },
};
