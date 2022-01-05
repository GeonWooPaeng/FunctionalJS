const log = console.log;

const curry =
  (f) =>
  (a, ..._) =>
    _.length ? f(a, ..._) : (..._) => f(a, ..._);

const go1 = (a, f) => (a instanceof Promise ? a.then(f) : f(a));

const map = curry((f, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(f(a));
  }
  return res;
});

const filter = curry((f, iter) => {
  let res = [];
  for (const a of iter) {
    if (f(a)) res.push(a);
  }
  return res;
});

const reduce = curry((f, acc, iter) => {
  if (!iter) {
    iter = acc[Symbol.iterator]();
    acc = iter.next().value;
  } else {
    iter = iter[Symbol.iterator]();
  }
  // for (const a of iter) {
  //   // acc = f(acc, a);
  //   //Promise 들어왔을 경우 해결
  //   acc = acc instanceof Promise ? acc.then((acc) => f(acc, a)) : f(acc, a);
  // }
  return go1(acc, function recur() {
    //유명함수 : 함수를 값으로 다루면서 함수의 이름을 짓는 기법
    let cur;
    while (!(cur = iter.next()).done) {
      const a = cur.value;
      acc = f(acc, a);
      if (acc instanceof Promise) return acc.then(recur);
    }
    return acc;
  });
});

const go = (...args) => reduce((a, f) => f(a), args);
const pipe =
  (f, ...fs) =>
  (...as) =>
    go(f(...as), ...fs);
