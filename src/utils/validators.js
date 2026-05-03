export function required(value) {
  return value ? '' : 'This field is required';
}

export function isPositiveNumber(value) {
  if (value === '' || Number(value) <= 0) return 'Must be a positive number';
  return '';
}
