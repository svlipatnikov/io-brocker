const OFF_BRIGHTNESS = 0
const NIGHT_BRIGHTNESS = 5
const DAY_BRIGHTNESS = 100

const LED_MOTION_DURATION = 3 * 60 * 1000 // 3min

on({ id: ['mqtt.0.kitchen.motion1', 'mqtt.0.kitchen.motion2'], change: 'any' }, async (obj) => {
    if (obj.state.val) {
        const brightness = isHomeNight()
            ? NIGHT_BRIGHTNESS
            : DAY_BRIGHTNESS

        clearStateDelayed('mqtt.0.kitchen.led-brightness.set')
        setState('mqtt.0.kitchen.led-brightness.set', brightness)
    } else {
        setStateDelayed('mqtt.0.kitchen.led-brightness.set', OFF_BRIGHTNESS, LED_MOTION_DURATION, true)
    }
})


// change auto change brightness
on({ id: 'mqtt.0.kitchen.light', change: 'any' }, async (obj) => {
    const { val: currentBrightness } = getState('mqtt.0.kitchen.led-brightness')

    if (currentBrightness !== OFF) {
        const targetBrightness = isHomeNight()
            ? NIGHT_BRIGHTNESS
            : DAY_BRIGHTNESS

        if (targetBrightness !== currentBrightness) {
            setState('mqtt.0.kitchen.led-brightness.set', targetBrightness)
        }
    }
})
