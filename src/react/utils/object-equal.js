
/** 对象是否相同 */
export const ObjectEqual = (a, b) => {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  const keysa = Object.keys(a);
  const keysb = Object.keys(b);
  if (keysa.length !== keysb.length) return false;
  for (var i in a) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};
