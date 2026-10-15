// A home sizing guide, not a site survey. Loads are typical running watts.
// Inverter sizes include startup headroom. Battery usable capacity is 85%.
// Panels are 550 W and the sun figure is 4.5 strong hours at 75% system yield.

const PANEL_WATTS = 550
const SUN_HOURS = 4.5
const SYSTEM_YIELD = 0.75
const BATTERY_USABLE = 0.85
const PANEL_DAILY_WH = PANEL_WATTS * SUN_HOURS * SYSTEM_YIELD
const INVERTER_STEPS_KW = [1, 1.5, 2.5, 3.5, 5, 7.5, 10, 12.5, 15, 20]

export const solarHomes = [
  { id: '1', label: '1 bedroom', detail: 'lights, a fan and a television', watts: 220 },
  { id: '2', label: '2 bedroom', detail: 'lights, fans and a television', watts: 340 },
  { id: '3', label: '3 bedroom flat', detail: 'lights, fans and a television', watts: 450 },
  { id: '4', label: '4 bedroom', detail: 'lights, fans and a television', watts: 620 },
  { id: 'duplex', label: 'Duplex', detail: 'lights, fans and televisions', watts: 860 },
]

export const solarHours = [
  { id: '4', hours: 4, label: '4 hours, an evening' },
  { id: '8', hours: 8, label: '8 hours, through the night' },
  { id: '12', hours: 12, label: '12 hours, most of the day' },
]

// running: stays on with the house, so it counts toward the inverter the whole time.
// Anything else is used in short spells. Those add their own energy, and the
// inverter is sized for the heaviest one of them plus whatever stays on.
export const solarLoads = [
  { id: 'fridge', label: 'Refrigerator', phrase: 'a refrigerator', watts: 150, duty: 0.45, minInverterKw: 1.5, running: true },
  { id: 'freezer', label: 'Chest freezer', phrase: 'a chest freezer', watts: 180, duty: 0.45, minInverterKw: 1.5, running: true },
  { id: 'dispenser', label: 'Water dispenser', phrase: 'a water dispenser', watts: 100, duty: 0.4, running: true },
  { id: 'pump', label: 'Water pump', phrase: 'a water pump', watts: 750, fixedHours: 0.5, minInverterKw: 2.5 },
  { id: 'washer', label: 'Washing machine', phrase: 'a washing machine', watts: 500, fixedHours: 1, minInverterKw: 1.5 },
  { id: 'microwave', label: 'Microwave', phrase: 'a microwave', watts: 1200, fixedHours: 0.3 },
  { id: 'kettle', label: 'Electric kettle', phrase: 'an electric kettle', watts: 1800, fixedHours: 0.25 },
  { id: 'iron', label: 'Electric iron', phrase: 'an electric iron', watts: 1200, fixedHours: 0.5 },
  { id: 'blender', label: 'Blender', phrase: 'a blender', watts: 400, fixedHours: 0.15 },
  { id: 'rice', label: 'Rice cooker', phrase: 'a rice cooker', watts: 700, fixedHours: 0.75 },
  { id: 'cooker', label: 'Electric cooker', phrase: 'an electric cooker', watts: 1500, fixedHours: 1 },
  { id: 'theatre', label: 'Home theatre', phrase: 'a home theatre', watts: 200, fixedHours: 4 },
  { id: 'computer', label: 'Desktop computer', phrase: 'a desktop computer', watts: 150, fixedHours: 4 },
  { id: 'ac', label: 'Air conditioner (1 HP)', phrase: 'an air conditioner', watts: 1100, duty: 1, minInverterKw: 3.5, running: true },
  { id: 'ac2', label: 'Extra air conditioner (1 HP)', phrase: 'an extra air conditioner', watts: 1100, duty: 1, minInverterKw: 5, running: true },
  { id: 'heater', label: 'Water heater', phrase: 'a water heater', watts: 3000, fixedHours: 0.4 },
]

function roundUp(value, steps) {
  return steps.find((step) => step >= value - 0.001) ?? Math.ceil(value / 2.5) * 2.5
}

function roundUpHalf(value) {
  return Math.ceil((value - 0.001) * 2) / 2
}

function formatKw(value) {
  return `${Number.isInteger(value) ? value : value} kW`
}

function formatKwh(value) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)} kWh`
}

function joinPhrases(items) {
  if (items.length <= 1) return items[0] || ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

const BEDROOM_WATTS = { 1: 220, 2: 340, 3: 450, 4: 620 }
const BEDROOM_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }

function wattsForBedrooms(count) {
  const bedrooms = Math.min(10, Math.max(1, Math.round(count)))
  if (BEDROOM_WATTS[bedrooms]) return BEDROOM_WATTS[bedrooms]
  return 620 + (bedrooms - 4) * 170
}

function bedroomsIn(text) {
  const digit = text.match(/(\d{1,2})\s*-?\s*bed/i)
  if (digit) return Number(digit[1])
  const word = text.toLowerCase().match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*-?\s*bed/)
  if (word) return BEDROOM_WORDS[word[1]]
  if (/\b(self[\s-]?con|studio|single room|room and parlour|room & parlour)\b/i.test(text)) return 1
  return null
}

function homeFromText(text) {
  const label = text.trim().replace(/\s+/g, ' ').slice(0, 80)
  if (!label) return null
  const bedrooms = bedroomsIn(label)
  const watts = bedrooms ? wattsForBedrooms(bedrooms) : BEDROOM_WATTS[3]
  const detail = bedrooms === 1 ? 'lights, a fan and a television' : 'lights, fans and a television'
  return { id: 'other', label, detail, watts, custom: true, assumed: !bedrooms }
}

function hoursFromValue(value) {
  const hours = Math.round(Number(value) * 2) / 2
  if (!Number.isFinite(hours) || hours < 1 || hours > 24) return null
  const shown = Number.isInteger(hours) ? String(hours) : hours.toFixed(1)
  return { id: 'other', hours, label: `${shown} hour${hours === 1 ? '' : 's'}`, custom: true }
}

function housePhrase(home) {
  const label = home.label.trim()
  if (!home.custom) return `A ${label.toLowerCase()}`
  if (/^(a|an)\s/i.test(label)) return label.charAt(0).toUpperCase() + label.slice(1)
  if (/^\d/.test(label)) return `A ${label.toLowerCase()}`
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function sizeSolar({ homeId, hoursId, customHome = '', customHours = '', loadIds }) {
  const home = homeId === 'other' ? homeFromText(customHome) : solarHomes.find((item) => item.id === homeId)
  const duration = hoursId === 'other' ? hoursFromValue(customHours) : solarHours.find((item) => item.id === hoursId)
  if (!home || !duration) return null
  const chosen = new Set(loadIds)
  const selected = solarLoads.filter((load) => chosen.has(load.id)).map((load) => {
    if (load.id === 'ac2' && !chosen.has('ac')) return { ...load, phrase: 'an air conditioner', minInverterKw: 3.5 }
    return load
  })
  const runningWatts = selected.reduce((sum, load) => sum + (load.running ? load.watts : 0), 0)
  const largestBurst = selected.reduce((max, load) => load.running ? max : Math.max(max, load.watts), 0)
  const peakWatts = home.watts + runningWatts + largestBurst
  const floorKw = selected.reduce((max, load) => Math.max(max, load.minInverterKw || 0), 1)
  const inverterKw = roundUp(Math.max((peakWatts * 1.25) / 1000, floorKw), INVERTER_STEPS_KW)

  const energyWh = home.watts * duration.hours + selected.reduce((sum, load) => {
    const hours = load.fixedHours != null
      ? Math.min(duration.hours, load.fixedHours)
      : duration.hours * (load.duty ?? 1)
    return sum + load.watts * hours
  }, 0)
  const batteryKwh = roundUpHalf(energyWh / BATTERY_USABLE / 1000)
  const panels = Math.max(2, Math.ceil(energyWh / PANEL_DAILY_WH))

  const extras = selected.map((load) => load.phrase)
  const extraText = extras.length ? `, plus ${joinPhrases(extras)}` : ''
  const summary = `${housePhrase(home)}, with ${home.detail} on for ${duration.hours} hours${extraText}.`

  return {
    inverterKw,
    inverterLabel: formatKw(inverterKw),
    batteryKwh,
    batteryLabel: formatKwh(batteryKwh),
    panels,
    panelWatts: PANEL_WATTS,
    panelsLabel: `${panels} × ${PANEL_WATTS} W`,
    summary,
    homeLabel: home.label,
    runLabel: duration.label,
    hasAirConditioner: chosen.has('ac') || chosen.has('ac2'),
    assumedHome: Boolean(home.assumed),
  }
}
