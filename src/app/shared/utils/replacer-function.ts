export const replacerFunc = () => {
  const visited = new WeakSet();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-arrow/prefer-arrow-functions
  return (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (visited.has(value)) {
        return;
      }
      visited.add(value);
    }
    return value;
  };
};
