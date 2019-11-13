export default class Store {
  constructor(key) {
    this.key = key;
    this.defaultKey = key + "_default";
    this.storage = window.localStorage;
  }

  get() {
    return this.storage.getItem(this.key);
  }

  getDefault() {
    return this.storage.getItem(this.defaultKey);
  }

  set(value) {
    try {
      this.storage.setItem(this.key, JSON.stringify(value));
    } catch (error) {
      this.clear();
    }
  }

  setDefault(value) {
    try {
      this.storage.setItem(this.defaultKey, JSON.stringify(value));
    } catch (error) {
      this.clearDefault();
    }
  }

  clear() {
    this.storage.removeItem(this.key);
  }

  clearDefault() {
    this.storage.removeItem(this.defaultKey);
  }
}
