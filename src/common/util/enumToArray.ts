export const enumToArray = <T extends { [s: string]: any }>(
  enumObj: T,
): T[] => {
  return Object.values(enumObj);
};
