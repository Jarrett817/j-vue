import {
  h,
  provide,
  inject,
  createTextVNode,
  getCurrentInstance,
} from '../../lib/guide-j-vue.ems.js';

const grandChild = {
  name: 'grandChild',
  render() {
    return h('h2', {}, 'I`m grandChild, My name is ' + this.name);
  },
  setup() {
    provide('name', 'wangwu');
    console.log('currentIns', getCurrentInstance());
    const name = inject('name');
    console.log('name', name);
    return {
      msg: 'vue',
      name,
    };
  },
};

const child = {
  name: 'Child',
  render() {
    return h('h1', {}, [
      createTextVNode('My name is ' + this.name),
      h(grandChild),
    ]);
  },
  setup() {
    const name = inject('name');
    provide('name', 'lisi');
    console.log('name', name);
    return {
      msg: 'vue',
      name,
    };
  },
};

export const App = {
  name: 'App',
  render() {
    return h('h1', {}, [h(child)]);
  },
  setup() {
    provide('name', 'zhangsan');
    return {};
  },
};
