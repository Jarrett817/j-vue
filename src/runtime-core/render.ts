import { ShapeFlags } from '../shared/shapeFlags';
import { createComponentInstance, setupComponent } from './component';

// const shapeFlags = {
//   element: 0,
//   stateful_component: 0,
//   text_children: 0,
//   array_children: 0,
// };
// flag不够高效、位运算更合适

export function render(vnode: any, container: any) {
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  // 处理组件
  // 判断是否是element
  const { shapeFlag } = vnode;
  // 如果是element
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container);
  }
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(initialVnode: any, container) {
  const instance = createComponentInstance(initialVnode);
  // 执行setup得到返回值，并设置render
  setupComponent(instance);
  // 执行render，继续处理子组件
  setupRenderEffect(instance, initialVnode, container);
}
function setupRenderEffect(instance: any, initialVnode, container) {
  const { proxy } = instance;
  // 为了实现直接在render里使用this.xxx获取setup中定义的变量和函数
  // 真正的值是从setupState里取
  const subTree = instance.render.call(proxy);
  patch(subTree, container);
  // 在当前子节点全部处理完毕后赋值
  initialVnode.el = subTree.el;
}
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
function mountElement(vnode: any, container: any) {
  const { type, children, props, shapeFlag } = vnode;
  const el = document.createElement(type);
  vnode.el = el;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el);
  }
  setAttribute(el, props);
  container.append(el);
}

function setAttribute(el, attribute) {
  if (attribute)
    for (const key in attribute) {
      // if (typeof attribute[key] === 'object') {
      //   el.setAttribute(key, attribute[key])
      //   setAttribute(el,)
      // } else
      el.setAttribute(key, attribute[key]);
    }
}

function mountChildren(children, container) {
  children.forEach(v => {
    patch(v, container);
  });
}
