const publicPropertiesMap = {
  $el: i => i.vnode.el,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // 必须在get时重新获取下setupState，否则可能拿到的是初始化时候的空对象
    const { setupState } = instance;
    if (key in setupState) return setupState[key];

    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) return publicGetter(instance);
  },
};
