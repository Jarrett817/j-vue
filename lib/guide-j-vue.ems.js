const extend = Object.assign;
const isObject = (val) => val !== null && typeof val === 'object';
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const camelize = (str) => str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : '';
});
const toHanderKey = (str) => (str ? 'on' + capitalize(str) : '');

// 简易的实现，将当前reactive对象的依赖存在全局map中
const targetMap = new Map();
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else
            effect.run();
    }
}
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
/* 使用 Proxy 的一个难点是 this 绑定。我们希望任何方法都绑定到这个 Proxy，而不是目标对象，
这样我们也可以拦截它们。值得庆幸的是，ES6 引入了另一个名为 Reflect 的新特性，
它允许我们以最小的代价消除了这个问题
*/
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key == "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow)
            return res;
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key:${key}set失败，因为 target 是 readonly`, target);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyGet, {
    get: shallowReadonlyGet,
});

function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn('target must be Object');
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}
// 观察者模式，收集依赖至effect，set时逐个遍历触发
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}

function emit(instance, event, ...args) {
    const { props } = instance;
    // TPP
    // 先写一个特定行为，再改成通用行为
    const handerName = toHanderKey(camelize(event));
    const handler = props[handerName];
    handler && handler(args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: i => i.vnode.el,
    $slots: i => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 必须在get时重新获取下setupState，否则可能拿到的是初始化时候的空对象
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter)
            return publicGetter(instance);
    },
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = props => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        el: null,
        provides: parent ? parent.provides : {},
        parent: parent || {},
        props: {},
        slots: {},
        emit: () => { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // 走到这一步，已经说明是组件类型
    initProps(instance, instance.vnode.props);
    // 渲染插槽就是把对应的children放到h函数里
    initSlots(instance, instance.vnode.children);
    // 初始化props和slots都在setup之前
    setupStateFulComponents(instance);
}
function setupStateFulComponents(instance) {
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
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (parentProvides === provides) {
            // 将父级的provides作为当前对象的原型
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        return parentProvides[key];
    }
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string'
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

// const shapeFlags = {
//   element: 0,
//   stateful_component: 0,
//   text_children: 0,
//   array_children: 0,
// };
// flag不够高效、位运算更合适
function render(vnode, container) {
    patch(vnode, container, null);
}
function patch(vnode, container, parentComponent) {
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
            if (shapeFlag & 1 /* ELEMENT */) {
                processElement(vnode, container, parentComponent);
            }
            else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                processComponent(vnode, container, parentComponent);
            }
            break;
    }
}
function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
}
function mountComponent(initialVnode, container, parentComponent) {
    const instance = createComponentInstance(initialVnode, parentComponent);
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
    patch(subTree, container, instance);
    // 在当前子节点全部处理完毕后赋值
    initialVnode.el = subTree.el;
}
function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
}
function mountElement(vnode, container, parentComponent) {
    const { type, children, props, shapeFlag } = vnode;
    const el = document.createElement(type);
    vnode.el = el;
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
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
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
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
function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode, container, parentComponent);
}
function processText(vnode, container) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
}

function createApp(rootComponent) {
    console.log('createApp');
    return {
        mount(rootContainer) {
            // 把根组件转解析为虚拟节点
            const vnode = createVNode(rootComponent);
            // 开始render
            console.log('开始render', vnode);
            render(vnode, typeof rootContainer === 'string'
                ? document.querySelector(rootContainer)
                : rootContainer);
        },
    };
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function')
            return createVNode(Fragment, {}, slot(props));
    }
}

export { createApp, createTextVNode, getCurrentInstance, h, inject, provide, renderSlots };
