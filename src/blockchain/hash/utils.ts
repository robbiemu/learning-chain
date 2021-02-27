import type { IaopDecoratorPayload } from '@lib/aop/aop-decorator-payload.interface'

export function interuptingBeforeMessage(this: any, value: string) {
  if (!value) {
    this.raw = undefined
    return 
  }
  return <IaopDecoratorPayload>{ flag: true }
}