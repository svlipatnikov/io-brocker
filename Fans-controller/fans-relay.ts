const FAN_RELAY_DURATION = 1000 * 60 * 20 // 20 min

on({id: 'mqtt.0.fan.toilet', change: 'any'}, async function (obj) {
    if (obj.state.val) {
        clearStateDelayed('mqtt.0.fan.toilet.set')
        setStateDelayed('mqtt.0.fan.toilet.set', false, FAN_RELAY_DURATION) 
    }
})

on({id: 'mqtt.0.fan.bathroom', change: 'any'}, async function (obj) {
    if (obj.state.val) {
        clearStateDelayed('mqtt.0.fan.bathroom.set')
        setStateDelayed('mqtt.0.fan.bathroom.set', false, FAN_RELAY_DURATION) 
    }
})

