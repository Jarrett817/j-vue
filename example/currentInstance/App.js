import { h, getCurrentInstance } from '../../lib/guide-j-vue.ems.js';

export const App = {
  name: 'App',
  render() {
    return h('h1', {}, '123');
  },
  setup() {
    console.log('currentInstance', getCurrentInstance());
    return {
      msg: 'vue',
    };
  },
};
