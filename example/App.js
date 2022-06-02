import { h } from '../lib/guide-j-vue.ems.js';
import { Foo } from './Foo.js';
// window.self = null;

export const App = {
  name: 'App',
  render() {
    // window.self = this;
    return h(
      'div',
      {
        class: 'red',
        onClick: () => {
          console.log('我被点击了');
        },
        onMousedown: () => {
          console.log('鼠标点击');
        },
        // onMousemove: () => {
        //   console.log('鼠标滑过');
        // },
      },
      [
        // 暂时必须传props
        // h('div', {}, 'hi,' + this.msg),
        // h('p', { style: { color: 'blue' } }, 'im blue'),
        // h('h1', {}, this.msg + '23123'),
        // h('div', {}, '测试props'),
        h(Foo, { count: 1 }),
      ]
    );
  },
  setup() {
    return {
      msg: 'vue',
    };
  },
};
