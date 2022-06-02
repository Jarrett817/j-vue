import { hasOwn } from '../shared/index';

const publicPropertiesMap = {
  $el: i => i.vnode.el,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // 必须在get时重新获取下setupState，否则可能拿到的是初始化时候的空对象
    const { setupState, props } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) return publicGetter(instance);
  },
};
