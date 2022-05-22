export const extend = Object.assign;

export const isObject = (val: any) => val !== null && typeof val === 'object';

export const hasChanged = (newValue: any, oldValue: any) =>
  !Object.is(newValue, oldValue);
