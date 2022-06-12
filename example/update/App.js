import { h, ref } from '../../lib/guide-j-vue.ems.js';

export const App = {
  name: 'App',
  setup() {
    const num = ref(0);
    const onClick = () => {
      num.value++;
    };
    return { num, onClick };
  },
  render() {
    return h('h1', {}, [
      h(
        'button',
        {
          onClick: this.onClick,
        },
        '点我点我'
      ),
      h('h2', {}, 'count' + this.num),
    ]);
  },
};
