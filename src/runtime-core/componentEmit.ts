import { camelize, toHanderKey } from '../shared/index';

export function emit(instance, event, ...args) {
  const { props } = instance;

  // TPP
  // 先写一个特定行为，再改成通用行为

  const handerName = toHanderKey(camelize(event));
  const handler = props[handerName];
  handler && handler(args);
}
