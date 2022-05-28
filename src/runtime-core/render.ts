import { createComponentInstance, setupComponent } from './component';

export function render(vnode: any, container: any) {
  patch(vnode, container);
}

function isElement(vnode) {
  if (typeof vnode.type === 'string') {
    return true;
  } else return false;
}

function patch(vnode: any, container: any) {
  // 处理组件
  // 判断是否是element
  if (isElement(vnode)) {
    processElement(vnode, container);
  } else processComponent(vnode, container);
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
  const { type, children, props } = vnode;
  const el = document.createElement(type);
  console.log('vnode', vnode);
  vnode.el = el;
  if (typeof children === 'string') {
    el.textContent = children;
  } else if (Array.isArray(children)) {
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
