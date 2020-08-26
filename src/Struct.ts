const Struct = (obj: Record<string | number | symbol, any>) => {
  if (typeof obj != "object" || Array.isArray(obj)) {
    throw new Error("Invalid struct");
  }
  return function (
      this: Record<string | number | symbol, any>,
      default_params = obj) {
      default_params = Object.assign(obj, default_params);
      for (let key of Object.keys(default_params)) {
          this[key] = default_params[key];
      }
      return new Proxy(this, {
          set(target, key, value) {
              if (!target.hasOwnProperty(key)) {
                  throw new TypeError(`Invalid property ${key.toString()}`);
              }
              // @ts-ignore
              target[key] = value;
              return true;
          },
      });
  } as unknown as (new (default_params: Record<string | number | symbol, any>) => { [K in keyof typeof default_params]: typeof default_params[K] });
};

export default Struct;
