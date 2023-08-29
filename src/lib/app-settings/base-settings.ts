import type Store from 'electron-store';

export class BaseSettings {
  #pendingChanges: { [key: string]: any };
  #store: Store;
  #scopeKey?: string;
  #isDirty: boolean = false;

  constructor(store: Store, scopeKey?: string) {
    this.#store = store;
    this.#pendingChanges = {};
    this.#scopeKey = scopeKey;
  }

  #getAbsoluteKey(key: string): string {
    if (this.#scopeKey) {
      return `${this.#scopeKey}.${key}`;
    }

    return key;
  }

  get hasPendingChanges(): boolean {
    return this.#isDirty;
  }

  protected set<TValue>(key: string, value: TValue) {
    this.#pendingChanges[this.#getAbsoluteKey(key)] = value;
    this.#isDirty = true;
  }

  protected get<TValue>(key: string, cast: (arg: unknown) => TValue, defaultValue?: TValue): TValue {
    const absoluteKey = this.#getAbsoluteKey(key);
    if (Object.hasOwn(this.#pendingChanges, absoluteKey)) {
      return cast(this.#pendingChanges[absoluteKey]);
    }

    return cast(this.#store.get(absoluteKey, defaultValue));
  }

  commit() {
    if (this.#isDirty) {
      this.#store.set(this.#pendingChanges);
      this.#pendingChanges = {};
      this.#isDirty = false;
    }
  }

  revert() {
    if (this.#isDirty) {
      this.#pendingChanges = {};
      this.#isDirty = false;
    }
  }
}
