import type { InjectionKey } from 'vue'
import { getCurrentInstance, inject } from 'vue'

export function injectHere<T>(key: InjectionKey<T> | string): T | undefined
export function injectHere<T>(key: InjectionKey<T> | string, defaultValue: T, treatDefaultAsFactory?: false): T
export function injectHere<T>(key: InjectionKey<T> | string, defaultValue: T | (() => T), treatDefaultAsFactory: true): T
export function injectHere(key: any, defaultValue?: any, treatDefaultAsFactory?: any) {
  return (getCurrentInstance() as any)?.provides[key] || inject(key, defaultValue, treatDefaultAsFactory)
}
