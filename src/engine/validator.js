
export function validateResult(actual, expected, tolerance = 1e-10) {
  if (
    !Number.isFinite(actual) ||
    !Number.isFinite(expected) ||
    !Number.isFinite(tolerance) ||
    tolerance < 0
  ) {
    return false;
  }

  const difference = Math.abs(actual - expected);

  const scale = Math.max(
    1,
    Math.abs(actual),
    Math.abs(expected)
  );

  return difference <= tolerance * scale;
}
