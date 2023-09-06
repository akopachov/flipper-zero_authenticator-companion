const globalObject = window || global || self || {};
let globalStore: Map<any, any> = globalObject['__globalSingletonStore'];
if (!globalStore || !(globalStore instanceof Map)) {
  globalStore = new Map();
  globalObject['__globalSingletonStore'] = globalStore;
}

export class Singleton {
  static instance<TKey, TValue>(key: TKey, instanceFactory: () => TValue): TValue {
    if (!globalStore.has(key)) {
      const value = instanceFactory();
      globalStore.set(key, value);
      return value;
    }

    return globalStore.get(key);
  }
}
