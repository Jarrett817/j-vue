import { h } from '../lib/guide-j-vue.ems.js';

export const Foo = {
  setup(props) {
    console.log('props', props);
  },
  render() {
    return h('h1', {}, 'foo: ' + this.count);
  },
};
