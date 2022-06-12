const extend = Object.assign;
const isObject = (val) => val !== null && typeof val === 'object';
const hasChanged = (newValue, oldValue) => !Object.is(newValue, oldValue);
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const camelize = (str) => str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : '';
});
const toHanderKey = (str) => (str ? 'on' + capitalize(str) : '');

let shouldTrack = false;
let activeEffect;
// 简易的实现，将当前reactive对象的依赖存在全局map中
const targetMap = new Map();
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = []; // dep相当于是该依赖的父级
        this.active = true;
        this._fn = fn;
    }
    run() {
        if (!this.active)
            return this._fn();
        shouldTrack = true;
        activeEffect = this;
        // 在执行this.fn的时候，fn里所用到的reactive变量，会将本对象作为依赖收集
        const result = this._fn();
        // 已经收集好依赖了，将shouldTrack置为false，表明在这个fn中所用到的reactive变量都已完成依赖收集
        // 不会再有另外的reactive变量以此为依赖了，因此关闭掉
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop)
                this.onStop();
            this.active = false;
            shouldTrack = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}
function effect(fn, options = {}) {
    // 生成一个依赖
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect; // 这一步，是为了能直接通过runner找到依赖本身
    return runner;
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function trackEffects(dep) {
    // 当前被获取的key添加一个依赖
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    // dep在这里相当于activeEffect的父级，后面需要通过父级来删除子级实现删除
    activeEffect.deps.push(dep);
}
function track(target, key) {
    if (!isTracking())
        return;
    // 一个reactive对象对应一个depsMap
    // 其中的每一个key都对应一个依赖dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
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
        !isReadonly && track(target, key);
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

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is
        // Object.is不会做强制的类型转换，并且区分Number.NaN和NaN,-0和+0，是更准确的对比
        if (!hasChanged(newValue, this._rawValue))
            return;
        this._rawValue = newValue;
        this._value = convert(newValue);
        triggerEffects(this.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!(ref === null || ref === void 0 ? void 0 : ref.__v_isRef);
}
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}
// template中使用给ref拆箱
function proxyRefs(objWithRefs) {
    return new Proxy(objWithRefs, {
        get(target, key) {
            return unref(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return Reflect.set(target[key], 'value', value);
            }
            else
                return Reflect.set(target, key, value);
        },
    });
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
        isMounted: false,
        subTree: {},
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
        instance.setupState = proxyRefs(setupResult);
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

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function')
            return createVNode(Fragment, {}, slot(props));
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 把根组件转解析为虚拟节点
                const vnode = createVNode(rootComponent);
                // 开始render
                render(vnode, typeof rootContainer === 'string'
                    ? document.querySelector(rootContainer)
                    : rootContainer);
            },
        };
    };
}

// const shapeFlags = {
//   element: 0,
//   stateful_component: 0,
//   text_children: 0,
//   array_children: 0,
// };
// flag不够高效、位运算更合适
function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null);
    }
    // n1,旧的虚拟节点
    function patch(n1, n2, container, parentComponent) {
        // 处理组件
        // 判断是否是element
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                // 如果是element
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVnode, container, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent);
        // 执行setup得到返回值，并设置render
        setupComponent(instance);
        // 执行render，继续处理子组件
        setupRenderEffect(instance, initialVnode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                // 为了实现直接在render里使用this.xxx获取setup中定义的变量和函数
                // 真正的值是从setupState里取
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                // 在当前子节点全部处理完毕后赋值
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
                console.log('123', subTree, prevSubTree);
            }
        });
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
    }
    function mountElement(vnode, container, parentComponent) {
        const { type, children, props, shapeFlag } = vnode;
        const el = hostCreateElement(type);
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
            hostPatchProp(el, key, val);
        }
        // container.append(el);
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            patch(null, v, container, parentComponent);
        });
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    return { createApp: createAppAPI(render) };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, parent) {
    parent.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
});
// createApp作为一种render层面下的实现导出
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots, renderer };
