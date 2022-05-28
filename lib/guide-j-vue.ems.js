function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
    };
    return vnode;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

const publicPropertiesMap = {
    $el: i => i.vnode.el,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 必须在get时重新获取下setupState，否则可能拿到的是初始化时候的空对象
        const { setupState } = instance;
        if (key in setupState)
            return setupState[key];
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter)
            return publicGetter(instance);
    },
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        el: null, // 这个el是真实dom
    };
    return component;
}
function setupComponent(instance) {
    // initProps
    // initSlots
    setupStateFulComponents(instance);
}
function setupStateFulComponents(instance) {
    const component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = component;
    if (setup) {
        // 调用setup获取返回值
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // setup返回值可以是object或者function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function isElement(vnode) {
    if (typeof vnode.type === 'string') {
        return true;
    }
    else
        return false;
}
function patch(vnode, container) {
    // 处理组件
    // 判断是否是element
    if (isElement(vnode)) {
        processElement(vnode, container);
    }
    else
        processComponent(vnode, container);
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVnode, container) {
    const instance = createComponentInstance(initialVnode);
    // 执行setup得到返回值，并设置render
    setupComponent(instance);
    // 执行render，继续处理子组件
    setupRenderEffect(instance, initialVnode, container);
}
function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance;
    // 为了实现直接在render里使用this.xxx获取setup中定义的变量和函数
    // 真正的值是从setupState里取
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    // 在当前子节点全部处理完毕后赋值
    initialVnode.el = subTree.el;
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, children, props } = vnode;
    const el = document.createElement(type);
    console.log('vnode', vnode);
    vnode.el = el;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
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

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 把根组件转解析为虚拟节点
            const vnode = createVNode(rootComponent);
            // 开始render
            console.log('开始render');
            render(vnode, typeof rootContainer === 'string'
                ? document.querySelector(rootContainer)
                : rootContainer);
        },
    };
}

export { createApp, h };
