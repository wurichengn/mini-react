
/**
 * 潜比较两个数组是否相同
 * @param {[]} a
 * @param {[]} b
 */
export const ArrayEqual = (a, b) => {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i > a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};
