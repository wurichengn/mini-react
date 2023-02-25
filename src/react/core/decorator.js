
export const memo = (func) => {
  func.__isMemo = true;
  return func;
};
