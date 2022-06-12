import { shallowReadonly } from '../reactivity/reactive';
import { emit } from './componentEmit';
import { initProps } from './componentProps';
import { PublicInstanceProxyHandlers } from './componentPublicInstance';
import { initSlots } from './componentSlots';

export function createComponentInstance(vnode: any, parent) {
  const component = {
    vnode, // 这是最初始的vnode
    type: vnode.type,
    setupState: {},
    el: null, // 这个el是真实dom
    provides: parent ? parent.provides : {},
    parent: parent || {},
    props: {},
    slots: {},
    emit: () => {},
  };
  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(instance: any) {
  // 走到这一步，已经说明是组件类型
  initProps(instance, instance.vnode.props);
  // 渲染插槽就是把对应的children放到h函数里
  initSlots(instance, instance.vnode.children);
  // 初始化props和slots都在setup之前

  setupStateFulComponents(instance);
}
function setupStateFulComponents(instance: any) {
  const component = instance.type;
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  const { setup } = component;
  if (setup) {
    setCurrentInstance(instance);
    // 调用setup获取返回值
    // 在setup里传入props
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    setCurrentInstance(null);
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  // setup返回值可以是object或者function
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
  const Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}

let currentInstance = null;
export function getCurrentInstance() {
  return currentInstance;
}

function setCurrentInstance(instance) {
  currentInstance = instance;
}
