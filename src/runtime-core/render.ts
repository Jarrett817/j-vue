import { createComponentInstance, setupComponent } from './component';

export function render(vnode: any, container: any) {
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  // 处理组件
  // 判断是否是element
  processElement(vnode, container);
  processComponent(vnode, container);
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode);
  // 执行setup得到返回值，并设置render
  setupComponent(instance);
  // 执行render，继续处理子组件
  setupRenderEffect(instance, container);
}
function setupRenderEffect(instance: any, container) {
  const subTree = instance.render();
  patch(subTree, container);
}
function processElement(vnode: any, container: any) {
  throw new Error('Function not implemented.');
}
