import { render } from './render';
import { createVNode } from './vnode';

export function createApp(rootComponent: any) {
  console.log('createApp');

  return {
    mount(rootContainer: any) {
      // 把根组件转解析为虚拟节点
      const vnode = createVNode(rootComponent);
      // 开始render
      console.log('开始render', vnode);

      render(
        vnode,
        typeof rootContainer === 'string'
          ? document.querySelector(rootContainer)
          : rootContainer
      );
    },
  };
}
