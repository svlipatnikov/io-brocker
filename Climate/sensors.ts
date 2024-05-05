const SENSOR_AVERAGE_LIMIT = 5

enum IRoom {
  LIVING_ROOM = 'living-room',
  KITCHEN = 'kitchen',
  KIDS_ROOM = 'kids-room',
  BEDROOM = 'bedroom',
  BATHROOM = 'bathroom',
}

enum IUse {
  AIR = 'air',
  FLOOR = 'floor',
}

enum IType {
  DS = 'ds',
  DHT = 'dht',
}

enum IMeasure {
  TEMP = 'temperature',
  HUM = 'humidity',
}

class Sensor {
  private _values: Array<number> = []
  private _errorTime: Date | null = null

  constructor(sensorId: string, options: [IRoom, IUse, IType, IMeasure]) {
    const [room, use, type, measure] = options
    const valuePath = ['sensors', room, use, type, measure].join('.')
    const errorPath = ['sensors', room, use, type, 'error'].join('.')

    createState(valuePath)
    createState(errorPath)

    on({ id: sensorId, change: 'any' }, async (obj) => {
      const current = obj.state.val
      const midValue = this.mid(current)
      setState(valuePath, midValue)

      if (midValue) {
        this._errorTime = new Date()
      } else {
        setState(errorPath, this._errorTime!.toLocaleString())
      }
    })
  }

  mid(current: string): number | null {
    if (current !== 'null') {
      this._values.push(parseFloat(current))
      if (this._values.length > SENSOR_AVERAGE_LIMIT) {
        this._values.shift()
      }
    } else {
      this._values.shift()
    }

    if (!this._values.length) {
      return null
    }

    return this._values.reduce((average, value) => average + value, 0) / this._values.length
  }
}


// Kitchen
new Sensor('mqtt.0.sensors.ds2-1.temperature', [IRoom.KITCHEN, IUse.FLOOR, IType.DS, IMeasure.TEMP])

// Living room
new Sensor('mqtt.0.sensors.ds2-2.temperature', [IRoom.LIVING_ROOM, IUse.FLOOR, IType.DS, IMeasure.TEMP])
new Sensor('mqtt.0.sensors.ds1-1.temperature', [IRoom.LIVING_ROOM, IUse.AIR, IType.DS, IMeasure.TEMP])
new Sensor('mqtt.0.sensors.dht1.temperature', [IRoom.LIVING_ROOM, IUse.AIR, IType.DHT, IMeasure.TEMP])
new Sensor('mqtt.0.sensors.dht1.humidity', [IRoom.LIVING_ROOM, IUse.AIR, IType.DHT, IMeasure.HUM])


// Bedroom
new Sensor('mqtt.0.sensors.ds2-4.temperature', [IRoom.BEDROOM, IUse.FLOOR, IType.DS, IMeasure.TEMP])
new Sensor('mqtt.0.sensors.ds1-2.temperature', [IRoom.BEDROOM, IUse.AIR, IType.DS, IMeasure.TEMP])
new Sensor('mqtt.0.sensors.dht2.temperature', [IRoom.BEDROOM, IUse.AIR, IType.DHT, IMeasure.TEMP])
new Sensor('mqtt.0.sensors.dht2.humidity', [IRoom.BEDROOM, IUse.AIR, IType.DHT, IMeasure.HUM])

// Kids room
new Sensor('mqtt.0.sensors.ds2-3.temperature', [IRoom.KIDS_ROOM, IUse.FLOOR, IType.DS, IMeasure.TEMP])
new Sensor('mqtt.0.sensors.ds1-3.temperature', [IRoom.KIDS_ROOM, IUse.AIR, IType.DS, IMeasure.TEMP])
new Sensor('mqtt.0.sensors.dht3.temperature', [IRoom.KIDS_ROOM, IUse.AIR, IType.DHT, IMeasure.TEMP])
new Sensor('mqtt.0.sensors.dht3.humidity', [IRoom.KIDS_ROOM, IUse.AIR, IType.DHT, IMeasure.HUM])

// Bathroom
new Sensor('mqtt.0.sensors.ds1-4.temperature', [IRoom.BATHROOM, IUse.AIR, IType.DS, IMeasure.TEMP])
new Sensor('mqtt.0.sensors.dht4.temperature', [IRoom.BATHROOM, IUse.AIR, IType.DHT, IMeasure.TEMP])
new Sensor('mqtt.0.sensors.dht4.humidity', [IRoom.BATHROOM, IUse.AIR, IType.DHT, IMeasure.HUM])
