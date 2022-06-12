import { ShapeFlags } from '../shared/shapeFlags';
import { createComponentInstance, setupComponent } from './component';
import { Fragment, Text } from './vnode';

// const shapeFlags = {
//   element: 0,
//   stateful_component: 0,
//   text_children: 0,
//   array_children: 0,
// };
// flag不够高效、位运算更合适

export function render(vnode: any, container: any) {
  patch(vnode, container, null);
}

function patch(vnode: any, container: any, parentComponent) {
  // 处理组件
  // 判断是否是element
  const { shapeFlag, type } = vnode;
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      // 如果是element
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent);
      }
      break;
  }
}

function processComponent(vnode: any, container: any, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}

function mountComponent(initialVnode: any, container, parentComponent) {
  const instance = createComponentInstance(initialVnode, parentComponent);
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
  patch(subTree, container, instance);
  // 在当前子节点全部处理完毕后赋值
  initialVnode.el = subTree.el;
}
function processElement(vnode: any, container: any, parentComponent) {
  mountElement(vnode, container, parentComponent);
}
function mountElement(vnode: any, container: any, parentComponent) {
  const { type, children, props, shapeFlag } = vnode;
  const el = document.createElement(type);
  vnode.el = el;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent);
  }
  for (const key in props) {
    const val = props[key];
    // 小步骤开发，先写具体，后面改通用
    // if (key === 'onClick') {
    //   el.addEventListener('click', val);
    // } else {
    //   el.setAttribute(key, val);
    // }
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }
  }
  container.append(el);
}

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach(v => {
    patch(v, container, parentComponent);
  });
}
function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode, container, parentComponent);
}

function processText(vnode, container) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}
