import { h } from '../lib/guide-j-vue.ems.js';
window.self = null;

export const App = {
  render() {
    window.self = this;
    return h('div', { class: 'red' }, [
      // h('div', 'hi,' + this.msg),
      h('p', { style: { color: 'blue' } }, 'im blue'),
      h('h1', {}, this.msg + '23123'),
    ]);
  },
  setup() {
    return {
      msg: 'vue',
    };
  },
};
