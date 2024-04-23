const WATER_RELAY_DURATION = 1000 * 60 * 10 // 20 min

// if water leak alarm from water sensor
on({id: 'mqtt.0.bath.water-leak', change: 'any'}, async function (obj) {
    if (obj.state.val) {
        setState('mqtt.0.toilet.water.set', false)
        setState('mqtt.0.toilet.led.set', ALARM)
        setState('mqtt.0.bath.led.set', ALARM)
    } else {
        setStateDelayed('mqtt.0.toilet.water.set', true, WATER_RELAY_DURATION, true)
        setStateDelayed('mqtt.0.toilet.led.set', OFF, WATER_RELAY_DURATION, true)
        setStateDelayed('mqtt.0.bath.led.set', OFF, WATER_RELAY_DURATION, true)
    }
})
