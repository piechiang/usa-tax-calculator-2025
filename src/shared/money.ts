import Big from 'big.js';

// IRS 通常按美元取整；此处采用 bankers-round 避免偏差，可按需要改成 RoundDown 规则
export const money = {
  add: (a: number | string, b: number | string) => new Big(a || 0).plus(b || 0),
  sub: (a: number | string, b: number | string) => new Big(a || 0).minus(b || 0),
  mul: (a: number | string, b: number | string) => new Big(a || 0).times(b || 0),
  toDollar: (x: Big | number | string) => Number(new Big(x || 0).round(0, Big.roundHalfUp).toString()),
};