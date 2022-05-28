import { h } from '../lib/guide-j-vue.ems.js';

export const App = {
  render() {
    return h('div', 'hi,' + this.msg);
  },
  setup() {
    return {
      msg: 'vue',
    };
  },
};
