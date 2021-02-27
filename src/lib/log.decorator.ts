export interface ILogMethodsConfig { when: boolean; }

export function LogMethods(config: ILogMethodsConfig) {
  return (target: any) => {
    if (config.when) {
      for (const propertyName of Object.keys(Object.getOwnPropertyDescriptors(target.prototype))) {
        if ( // ensure the property is not a computed value
          (Object.getOwnPropertyDescriptor(target.prototype, propertyName)?.get)
          || !(target.prototype[propertyName] instanceof Function)
        ) {
          continue;
        }

        const descriptor = getMethodDescriptor(propertyName);
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
          // tslint:disable-next-line: no-console
          queueMicrotask (console.debug.bind (console, `%c[${target.name}::${propertyName}]`, 'color: goldenrod', ...args));
          return originalMethod.apply(this, args);
        };

        Object.defineProperty(target.prototype, propertyName, descriptor);
      }
    }
    return target;

    function getMethodDescriptor(propertyName: string): TypedPropertyDescriptor<any> {
      if (target.prototype.hasOwnProperty(propertyName)) {
        return Object.getOwnPropertyDescriptor(target.prototype, propertyName)!;
      }

      // create a new property descriptor for the base class' method
      return {
        configurable: true,
        enumerable: true,
        writable: true,
        value: target.prototype[propertyName]
      };
    }
  };
}
