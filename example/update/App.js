import { h, ref } from '../../lib/guide-j-vue.ems.js';

export const App = {
  name: 'App',
  setup() {
    const num = ref(0);
    const props = ref({ foo: 'foo', bar: 'bar' });
    const onClick = () => {
      num.value++;
    };
    const changePropsDemo1 = () => {
      props.value.foo = 'new-foo';
    };
    const changePropsDemo2 = () => {
      props.value.foo = undefined;
    };
    const changePropsDemo3 = () => {
      props.value = {
        foo: 'foo',
      };
    };
    return {
      num,
      onClick,
      changePropsDemo1,
      changePropsDemo2,
      changePropsDemo3,
      props,
    };
  },
  render() {
    console.log('rerender', this);
    return h('h1', { ...this.props }, [
      h('h2', {}, 'count' + this.num),
      h(
        'button',
        {
          onClick: this.onClick,
        },
        '点我点我'
      ),
      h(
        'button',
        {
          onClick: this.changePropsDemo1,
        },
        'changePropsDemo1'
      ),
      h(
        'button',
        {
          onClick: this.changePropsDemo2,
        },
        'changePropsDemo2'
      ),
      h(
        'button',
        {
          onClick: this.changePropsDemo3,
        },
        'changePropsDemo3'
      ),
    ]);
  },
};
