export const extend = Object.assign;

export const isObject = (val: any) => val !== null && typeof val === 'object';

export const hasChanged = (newValue: any, oldValue: any) =>
  !Object.is(newValue, oldValue);

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const camelize = (str: string) =>
  str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : '';
  });

export const toHanderKey = (str: string) => (str ? 'on' + capitalize(str) : '');

export const EMPTY_OBJ = {};
