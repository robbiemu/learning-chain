import type { IaopDecoratorPayload } from './aop-decorator-payload.interface'

export function InterruptingBefore (before: Function) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any) {
      const result: IaopDecoratorPayload | undefined = before.call(this, ...args)
      if(result) {
        if (result.flag) {
          if(result.payload) {
            return originalMethod.bind(this)(...result.payload)
          } else {
            return originalMethod.bind(this)(...args)
          }
        } else {
          console.info(`[InterruptingBefore@${target.constructor.name}::${propertyKey}] interuppting execution`)
          return result?.payload
        }
      }
    }
  }
}