type StandardEnum<T> = {
  [id: string]: T;
};

export function getKeyByValue<TValue, TEnum extends StandardEnum<TValue>>(enum_: TEnum, value: TValue) {
  const indexOfS = Object.values(enum_).indexOf(value);
  return Object.keys(enum_)[indexOfS];
}
