export const log = {
  debug: (...values: unknown[]) => {
    if (__DEV__) console.debug(...values)
  },
  warn: (...values: unknown[]) => {
    if (__DEV__) console.warn(...values)
  },
  error: (...values: unknown[]) => {
    if (__DEV__) console.error(...values)
  },
}
