const OFF = 0
const RAINBOW = 1
const NIGHT = 2
const ALARM = 3
const SPARKLES = 4

const isHomeNight = (): boolean => {
  const hoursNow = new Date().getHours()
  const isNight = hoursNow >= 22 || hoursNow <= 6
  const { val: isLight } = getState('mqtt.0.kitchen.light')

  return isNight && !isLight
}
