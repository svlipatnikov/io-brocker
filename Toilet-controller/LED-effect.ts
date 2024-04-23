const TOILET_LED_MOTION_DURATION = 2 * 60 * 1000 // 2min
const TOILET_LED_MANUAL_DURATION = 10 * 60 * 1000 // 10min

enum IEffect {
    OFF = 0,
    RAINBOW = 1,
    NIGHT = 2,
    ALARM = 3,
    SPARKLES = 4,
}

let manualTimer: number | null = null

// Motion mode
on({ id: 'mqtt.0.toilet.motion', change: 'any' }, async (obj) => {
    if (manualTimer) {
        return
    }

    const hasMotion = obj.state.val
    if (hasMotion) {
        const targetEffect = isHomeNight() ? IEffect.NIGHT : IEffect.RAINBOW

        setState('mqtt.0.toilet.led.set', targetEffect)
        setStateDelayed('mqtt.0.toilet.led.set', IEffect.OFF, TOILET_LED_MOTION_DURATION, true)
    }
})

// Manual mode
on({ id: 'mqtt.0.toilet.led', change: 'any' }, async (obj) => {
    const effect = obj.state.val
    const { val: motion } = getState('mqtt.0.toilet.motion')

    if (effect !== IEffect.OFF && !motion) {
        manualTimer = setStateDelayed('mqtt.0.toilet.led.set', IEffect.OFF, TOILET_LED_MANUAL_DURATION, true)
    }

    if (effect === IEffect.OFF && manualTimer) {
        clearStateDelayed('mqtt.0.toilet.led.set', manualTimer)
        manualTimer = null
    }
})

