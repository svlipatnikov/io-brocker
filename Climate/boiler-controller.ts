schedule({ hour: 6, minute: 0 }, () => {
  setState('mqtt.0.climate.gvs_pump.set', true)
})

schedule({ hour: 23, minute: 0 }, () => {
  setState('mqtt.0.climate.gvs_pump.set', false)
})
