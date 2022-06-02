import { shallowReadonly } from '../reactivity/reactive';
import { initProps } from './componentProps';
import { PublicInstanceProxyHandlers } from './componentPublicInstance';

export function createComponentInstance(vnode: any) {
  const component = {
    vnode, // 这是最初始的vnode
    type: vnode.type,
    setupState: {},
    el: null, // 这个el是真实dom
    props: {},
  };

  return component;
}

export function setupComponent(instance: any) {
  // initSlots
  initProps(instance, instance.vnode.props);
  setupStateFulComponents(instance);
}
function setupStateFulComponents(instance: any) {
  const component = instance.type;
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  const { setup } = component;
  if (setup) {
    // 调用setup获取返回值

    const setupResult = setup(shallowReadonly(instance.props));
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
