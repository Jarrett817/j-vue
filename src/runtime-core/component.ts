export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
  };

  return component;
}

export function setupComponent(instance: any) {
  // initProps
  // initSlots

  setupStateFulComponents(instance);
}
function setupStateFulComponents(instance: any) {
  const component = instance.vnode.type;
  const { setup } = component;
  if (setup) {
    // 调用setup获取返回值
    const setupResult = setup();
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
