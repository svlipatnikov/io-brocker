const AIR_HYSTERESIS_DELTA = 0.1
const FLOOR_HYSTERESIS_DELTA = 0.4

const hysteresis = (prev: boolean, current: number | null, target: number | null, delta: number | null): boolean => {
  if (current === null || target === null || delta === null) {
    return prev
  }
  return current < target - delta ? true : current > target + delta ? false : prev
}

enum IControllerMode {
  AUTO,
  OFF,
  ON,
}

abstract class Controller {
  private _sensorId: string
  private _controlId: string
  private _controlSetId: string
  private _mode: IControllerMode = IControllerMode.AUTO

  private _controlState: boolean = false
  private _value: number | null = null

  protected _target: number | null = null
  protected _delta: number | null = null
  private _onChange?: (newValue: boolean) => void

  constructor({ sensorId, controlId, controlSetId }) {
    this._controlId = controlId
    this._controlSetId = controlSetId
    this._sensorId = sensorId

    on({ id: this._sensorId, change: 'any' }, async (obj) => {
      this._value = obj.state.val === -128 ? null : obj.state.val
      this.execute()
    })
    on({ id: this._controlId, change: 'any' }, async (obj) => {
      this._controlState = obj.state.val
      this._onChange?.(obj.state.val)
    })
  }

  setCallback(cb: (value: boolean) => void): Controller {
    this._onChange = cb
    return this
  }

  on(): Controller {
    this._mode = IControllerMode.ON
    this.execute()
    return this
  }

  off(): Controller {
    this._mode = IControllerMode.OFF
    this.execute()
    return this
  }

  auto(target?: number): Controller {
    if (target) {
      this._target = target
    }
    this._mode = IControllerMode.AUTO
    this.execute()
    return this
  }

  execute(): Controller {
    switch (this._mode) {
      case IControllerMode.ON:
        setState(this._controlSetId, true)
        break

      case IControllerMode.OFF:
        setState(this._controlSetId, false)
        break

      case IControllerMode.AUTO:
      default:
        setState(this._controlSetId, hysteresis(this._controlState, this._value, this._target, this._delta))
    }
    return this
  }
}

class FloorController extends Controller {
  protected _delta: number = FLOOR_HYSTERESIS_DELTA;
}

class AirController extends Controller {
  protected _delta: number = AIR_HYSTERESIS_DELTA;
}


class Room {
  private _floorControllers: Array<FloorController> = []
  private _airControllers: Array<AirController> = []

  constructor({ floorControllers, airControllers }) {
    this._floorControllers = floorControllers
    this._airControllers = airControllers
  }

  // включение пола когда включена батарея
  enhancedHeating() {
    this._airControllers.forEach((ac: AirController) => ac.setCallback(
      (airState) => this._floorControllers.forEach(fc => airState ? fc.on() : fc.auto())
    ))
    return this
  }

  on(): Room {
    [...this._airControllers, ...this._floorControllers].forEach(c => c.on())
    return this
  }

  off(): Room {
    [...this._airControllers, ...this._floorControllers].forEach(c => c.off())
    return this
  }

  auto(): Room {
    [...this._airControllers, ...this._floorControllers].forEach(c => c.auto())
    return this
  }
}

//-------------------------------------

const bedroomFloor = new FloorController({
  sensorId: 'javascript.0.sensors.bedroom.floor.ds.temperature',
  controlId: 'mqtt.0.climate.tp_valve_bed',
  controlSetId: 'mqtt.0.climate.tp_valve_bed.set',
})

const bedroomAir = new AirController({
  sensorId: 'javascript.0.sensors.bedroom.air.ds.temperature',
  controlId: 'mqtt.0.climate.bat_valve_bed',
  controlSetId: 'mqtt.0.climate.bat_valve_bed.set',
})

const childrenFloor = new FloorController({
  sensorId: 'javascript.0.sensors.kids-room.floor.ds.temperature',
  controlId: 'mqtt.0.climate.tp_valve_det',
  controlSetId: 'mqtt.0.climate.tp_valve_det.set',
})

const childrenAir = new AirController({
  sensorId: 'javascript.0.sensors.kids-room.air.ds.temperature',
  controlId: 'mqtt.0.climate.bat_valve_det',
  controlSetId: 'mqtt.0.climate.bat_valve_det.set',
})

const livingRoomFloor = new FloorController({
  sensorId: 'javascript.0.sensors.living-room.floor.ds.temperature',
  controlId: 'mqtt.0.climate.tp_valve_din',
  controlSetId: 'mqtt.0.climate.tp_valve_din.set',
})

const kitchenFloor = new FloorController({
  sensorId: 'javascript.0.sensors.kitchen.floor.ds.temperature',
  controlId: 'mqtt.0.climate.tp_valve_kit',
  controlSetId: 'mqtt.0.climate.tp_valve_kit.set',
})

const livingRoomAir = new AirController({
  sensorId: 'javascript.0.sensors.living-room.air.ds.temperature',
  controlId: 'mqtt.0.climate.bat_valve_din',
  controlSetId: 'mqtt.0.climate.bat_valve_din.set'
})

// спальня
bedroomAir.auto(23.4)
bedroomFloor.auto(25)

// детская
childrenAir.auto(23.7)
childrenFloor.auto(26)

// гостиная
livingRoomAir.auto(23.5)
livingRoomFloor.auto(25)
kitchenFloor.auto(24)

// пол в коридоре всегда Вкл
setState('mqtt.0.climate.tp_valve_bath.set', true)

//-------------------------------------

const bedroom = new Room({ airControllers: [bedroomAir], floorControllers: [bedroomFloor] }).enhancedHeating()
const childrenRoom = new Room({ airControllers: [childrenAir], floorControllers: [childrenFloor] }).enhancedHeating()
const livingRoom = new Room({ airControllers: [livingRoomAir], floorControllers: [livingRoomFloor, kitchenFloor] }).enhancedHeating()

//-------------------------------------

class Home {
  private _rooms: Array<Room> = []
  private _schedulers: Array<number> = []

  constructor(rooms: Array<Room>) {
    this._rooms = rooms
  }

  morningHeating(): Home {
    const s1 = schedule({ hour: 6, minute: 20 }, () => this._rooms.forEach(r => r.on()))
    const s2 = schedule({ hour: 6, minute: 30 }, () => this._rooms.forEach(r => r.auto()))
    this._schedulers.push(s1, s2)
    return this
  }
}

const myHome = new Home([bedroom, childrenRoom, livingRoom]).morningHeating()
