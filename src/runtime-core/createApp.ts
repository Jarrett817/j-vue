import { createVNode } from './vnode';

export function createAppAPI(render) {
  return function createApp(rootComponent: any) {
    return {
      mount(rootContainer: any) {
        // 把根组件转解析为虚拟节点
        const vnode = createVNode(rootComponent);
        // 开始render

        render(
          vnode,
          typeof rootContainer === 'string'
            ? document.querySelector(rootContainer)
            : rootContainer
        );
      },
    };
  };
}
