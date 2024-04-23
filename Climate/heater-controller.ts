const VALVE_SWITCH_DELAY = 2 * 60 * 1000

on({
  id: [
    'mqtt.0.climate.tp_valve_bed',
    'mqtt.0.climate.tp_valve_det',
    'mqtt.0.climate.tp_valve_din',
    'mqtt.0.climate.tp_valve_kit',
    'mqtt.0.climate.bat_valve_bed',
    'mqtt.0.climate.bat_valve_det',
    'mqtt.0.climate.bat_valve_din',
  ],
  change: 'ne'
}, (obj) => {
  const { val: tp_valve_bed } = getState('mqtt.0.climate.tp_valve_bed')
  const { val: tp_valve_det } = getState('mqtt.0.climate.tp_valve_det')
  const { val: tp_valve_din } = getState('mqtt.0.climate.tp_valve_din')
  const { val: tp_valve_kit } = getState('mqtt.0.climate.tp_valve_kit')

  const { val: bat_valve_bed } = getState('mqtt.0.climate.bat_valve_bed')
  const { val: bat_valve_det } = getState('mqtt.0.climate.bat_valve_det')
  const { val: bat_valve_din } = getState('mqtt.0.climate.bat_valve_din')

  const heaterState = tp_valve_bed || tp_valve_det || tp_valve_din || tp_valve_kit || bat_valve_bed || bat_valve_det || bat_valve_din

  if (heaterState) {
    setStateDelayed('mqtt.0.climate.heater.set', true, VALVE_SWITCH_DELAY, true)
  } else {
    setState('mqtt.0.climate.heater.set', false)
    clearStateDelayed('mqtt.0.climate.heater.set')
  }

  const floorPompState = tp_valve_bed || tp_valve_det || tp_valve_din || tp_valve_kit

  if (floorPompState) {
    setStateDelayed('mqtt.0.climate.tp_pump.set', true, VALVE_SWITCH_DELAY, true)
  } else {
    setState('mqtt.0.climate.tp_pump.set', false)
    clearStateDelayed('mqtt.0.climate.tp_pump.set')
  }
})
