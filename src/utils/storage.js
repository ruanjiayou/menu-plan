const storage = {
  prefix: 'menu-plan:',
  setValue(key, value) {
    window.localStorage.setItem(
      this.prefix + key,
      value,
    );
  },
  getValue(key) {
    return window.localStorage.getItem(this.prefix + key);
  },
  removeKey(key) {
    window.localStorage.removeItem(this.prefix + key);
  },
};

export default storage;