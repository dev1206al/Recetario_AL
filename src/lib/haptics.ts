export const haptics = {
  light: () => navigator.vibrate?.(20),
  medium: () => navigator.vibrate?.(40),
  success: () => navigator.vibrate?.([30, 50, 30]),
  error: () => navigator.vibrate?.([80, 40, 80]),
}
