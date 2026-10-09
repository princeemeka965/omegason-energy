/*
  PRODUCT CATALOGUE
  ------------------------------------------------------------
  To add a product, copy one object below, give it a unique `slug`, and save.
  The Products page, product detail page, home page highlights and search all update on their own.

  Fields
    slug        unique, lowercase, hyphens only. It becomes the URL: /products/<slug>
    name        product name
    category    one of the ids in `categories` below
    summary     one short sentence shown on cards
    description a paragraph shown on the detail page
    price       number in naira (e.g. 185000), or null to show "Request a quote"
    image       optional image URL or /public path (e.g. "/products/panel.jpg").
                Leave null to use the built-in illustration for the category.
    featured    true to show on the home page
    specs       [{ label, value }] shown as a table on the detail page
    features    short bullet points on the detail page
    sample      true shows a "Sample" tag. DELETE this line when the listing is real.

  The 24 listings below are SAMPLES, illustrated with real photographs, so the
  catalogue layout can be reviewed. Replace the names, specs and prices with
  your real stock before going live.
*/

export const categories = [
  { id: 'panels', label: 'Solar panels' },
  { id: 'inverters', label: 'Inverters' },
  { id: 'batteries', label: 'Batteries' },
  { id: 'lighting', label: 'Solar lighting' },
  { id: 'kits', label: 'Home and business kits' },
]

export const products = [
  {
    slug: 'monocrystalline-solar-panel',
    name: 'Monocrystalline solar panel',
    category: 'panels',
    summary: 'Black-cell module for rooftops where space is tight.',
    description:
      'A sample monocrystalline module with a dark cell surface and a silver frame. Use it to show how a single panel looks in the catalogue. Replace the rating and warranty with the module you actually stock.',
    price: null,
    image: '/products/px-9875441.jpg',
    featured: true,
    sample: true,
    specs: [
      { label: 'Rated power', value: '450 W (sample)' },
      { label: 'Cell type', value: 'Monocrystalline' },
      { label: 'Frame', value: 'Anodised aluminium' },
    ],
    features: ['High output from a compact footprint', 'Suitable for rooftop mounting', 'Works with standard string inverters'],
  },
  {
    slug: 'polycrystalline-solar-panel',
    name: 'Polycrystalline solar panel',
    category: 'panels',
    summary: 'Blue-cell module for larger roofs and ground arrays.',
    description:
      'A sample polycrystalline module, shown as a blue cell field. It is the everyday panel for sites where roof area is not the limit. Swap in your real wattage and datasheet before publishing.',
    price: null,
    image: '/products/px-356049.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Rated power', value: '330 W (sample)' },
      { label: 'Cell type', value: 'Polycrystalline' },
      { label: 'Use', value: 'Roof and ground mount' },
    ],
    features: ['Lower cost per watt on large roofs', 'Proven cell technology', 'Pairs with the same mounting rails as mono modules'],
  },
  {
    slug: 'rooftop-solar-module',
    name: 'Rooftop solar module',
    category: 'panels',
    summary: 'A single framed panel sized for tile and sheet roofs.',
    description:
      'A sample rooftop module photographed on clay tiles. It stands in for the panel you would specify for a house or small shop. Confirm flashings and roof structure on site.',
    price: null,
    image: '/products/px-9875440.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Rated power', value: '400 W (sample)' },
      { label: 'Mounting', value: 'Pitched roof' },
      { label: 'Cells', value: 'Monocrystalline' },
    ],
    features: ['Framed for standard roof hooks', 'Works on tile and long-span sheet', 'Sized for a typical household string'],
  },
  {
    slug: 'rooftop-array-panel',
    name: 'Rooftop array panel',
    category: 'panels',
    summary: 'Modules laid out as a residential roof array.',
    description:
      'A sample of how several modules sit together on a pitched roof. The listing is for the panel itself; installation is quoted separately.',
    price: null,
    image: '/products/panel-array.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Rated power', value: '410 W (sample)' },
      { label: 'Layout', value: 'Portrait on rails' },
      { label: 'Roof type', value: 'Pitched' },
    ],
    features: ['Designed to tile across a roof face', 'Rail-mounted', 'Room for a walkway at the ridge'],
  },
  {
    slug: 'flat-roof-solar-array',
    name: 'Flat-roof solar array',
    category: 'panels',
    summary: 'Tilted modules for a flat concrete roof.',
    description:
      'A sample four-module array on a flat roof, tilted toward the sun on simple stands. Use it to show a small commercial or home roof where the surface itself is level.',
    price: null,
    image: '/products/panel-syria.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Array', value: '4 modules (sample)' },
      { label: 'Mounting', value: 'Tilted stands' },
      { label: 'Roof', value: 'Flat concrete' },
    ],
    features: ['No roof penetration in the sample layout', 'Tilt set for better yield', 'Easy to expand by another row'],
  },
  {
    slug: 'ground-mount-solar-array',
    name: 'Ground-mount solar array',
    category: 'panels',
    summary: 'Rows of modules on posts, for open land.',
    description:
      'A sample ground-mounted array. It is the layout used when the roof is too small or too shaded and there is open ground beside the building.',
    price: null,
    image: '/products/panel-farm.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Mounting', value: 'Ground posts' },
      { label: 'Layout', value: 'Single-axis rows' },
      { label: 'Use', value: 'Farms, estates, yards' },
    ],
    features: ['Keeps the roof clear', 'Easier to clean from the ground', 'Can grow row by row'],
  },
  {
    slug: 'hybrid-inverter',
    name: 'Hybrid solar inverter',
    category: 'inverters',
    summary: 'Runs from solar, battery and grid in one unit.',
    description:
      'A sample hybrid inverter shown with a matching panel string. It is the kind of unit that switches between solar, battery and mains. Replace it with the model, kVA and warranty you sell.',
    price: null,
    image: '/products/inverter-edge.jpg',
    featured: true,
    sample: true,
    specs: [
      { label: 'Capacity', value: '5 kVA (sample)' },
      { label: 'Inputs', value: 'Solar, battery, grid' },
      { label: 'Output', value: 'Pure sine wave' },
    ],
    features: ['Automatic source switching', 'Battery and solar monitoring', 'Wall mounted'],
  },
  {
    slug: 'string-inverter',
    name: 'Wall-mounted string inverter',
    category: 'inverters',
    summary: 'A string inverter fixed to the wall beside the cable run.',
    description:
      'A sample string inverter as it looks once installed, with DC and AC cables leaving the bottom of the case. It converts a rooftop string into mains power.',
    price: null,
    image: '/products/inverter-string.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Capacity', value: '3 kW (sample)' },
      { label: 'Mounting', value: 'Indoor wall' },
      { label: 'Display', value: 'Front status screen' },
    ],
    features: ['Compact wall cabinet', 'Status readable at a glance', 'Cables exit through the base'],
  },
  {
    slug: 'central-inverter',
    name: 'Commercial central inverter',
    category: 'inverters',
    summary: 'A floor-standing inverter for a large array.',
    description:
      'A sample central inverter cabinet for a commercial or estate array. It sits beside the array rather than on a house wall, and it is sized for many strings at once.',
    price: null,
    image: '/products/inverter-central.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Form', value: 'Floor-standing cabinet' },
      { label: 'Use', value: 'Commercial arrays' },
      { label: 'Phases', value: 'Three-phase (sample)' },
    ],
    features: ['Serves a whole array from one cabinet', 'Lockable enclosure', 'Sited next to the mounting structure'],
  },
  {
    slug: 'hybrid-inverter-assembly',
    name: 'Hybrid inverter assembly',
    category: 'inverters',
    summary: 'The power stage inside a hybrid inverter.',
    description:
      'A sample hybrid inverter with the cover off, so the fans, magnetics and terminal block are visible. It is here to show the hardware behind the cabinet, not as a unit sold open.',
    price: null,
    image: '/products/inverter-hybrid.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Cooling', value: 'Internal fans' },
      { label: 'Connections', value: 'Solar, battery, AC' },
      { label: 'Service', value: 'Cover removed for the photo' },
    ],
    features: ['Shows the real power electronics', 'Terminals for solar, battery and AC', 'Fan-cooled'],
  },
  {
    slug: 'lithium-battery-bank',
    name: 'Wall lithium battery',
    category: 'batteries',
    summary: 'Wall-mounted lithium storage for a home or shop.',
    description:
      'A sample wall battery, shown as stackable white cabinets. Daytime solar charges it; the house draws on it after sunset or during an outage. Capacity below is illustrative.',
    price: null,
    image: '/products/battery-wall.jpg',
    featured: true,
    sample: true,
    specs: [
      { label: 'Capacity', value: '5 kWh per cabinet (sample)' },
      { label: 'Chemistry', value: 'Lithium' },
      { label: 'Mounting', value: 'Wall, stackable' },
    ],
    features: ['Lives on the wall, not on the floor', 'Add cabinets as the load grows', 'Built-in status light'],
  },
  {
    slug: 'lithium-battery-module',
    name: 'Lithium battery module',
    category: 'batteries',
    summary: 'A boxed lithium module with a charge port.',
    description:
      'A sample lithium module in a steel case, with a charge connector on the face. It stands in for the block you would rack inside a larger bank.',
    price: null,
    image: '/products/battery-pack.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Form', value: 'Cased module' },
      { label: 'Chemistry', value: 'Lithium-ion' },
      { label: 'Connection', value: 'Charge lead on the top' },
    ],
    features: ['Closed steel case', 'Charge port on the front', 'Built to sit inside a cabinet'],
  },
  {
    slug: 'rack-battery-cabinet',
    name: 'Rack battery cabinet',
    category: 'batteries',
    summary: 'Batteries and switchgear in one floor cabinet.',
    description:
      'A sample storage cabinet with battery blocks stacked under the inverter and breakers. It is the layout used when a shop or clinic needs more than a single wall unit.',
    price: null,
    image: '/products/battery-rack.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Form', value: 'Floor cabinet' },
      { label: 'Contents', value: 'Batteries, inverter, breakers' },
      { label: 'Capacity', value: '10 kWh class (sample)' },
    ],
    features: ['Everything in one locked cabinet', 'Room to add another battery block', 'Breakers accessible at the top'],
  },
  {
    slug: 'gel-solar-battery',
    name: '12 V gel battery',
    category: 'batteries',
    summary: 'A sealed gel battery for lights and small systems.',
    description:
      'A sample 12-volt gel battery. It is the sealed block used in solar street lights, gate motors and other small loads, not a whole-home bank.',
    price: null,
    image: '/products/battery-gel.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Voltage', value: '12 V' },
      { label: 'Type', value: 'Sealed gel' },
      { label: 'Capacity', value: '15 Ah class (sample)' },
    ],
    features: ['Sealed, so it can sit indoors', 'Suited to lighting and small loads', 'Maintenance free'],
  },
  {
    slug: 'portable-power-station',
    name: 'Portable power station',
    category: 'batteries',
    summary: 'A carry-out battery with USB and DC outlets.',
    description:
      'A sample portable power station. It charges from a panel or the wall, then runs phones, lights and small appliances from the ports on the back.',
    price: null,
    image: '/products/battery-portable.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Outputs', value: 'USB and DC' },
      { label: 'Form', value: 'Portable' },
      { label: 'Charging', value: 'Solar or mains' },
    ],
    features: ['No installation', 'USB for phones and routers', 'DC outlet for small appliances'],
  },
  {
    slug: 'solar-street-light',
    name: 'Solar street light',
    category: 'lighting',
    summary: 'Pole light with its own panel and battery box.',
    description:
      'A sample solar street light: panel on top of the pole, battery box on the shaft, and a lamp head over the road. It charges by day and switches on at dusk without a grid connection.',
    price: null,
    image: '/products/light-mammoth.jpg',
    featured: true,
    sample: true,
    specs: [
      { label: 'Mounting', value: 'Pole' },
      { label: 'Panel', value: 'On the pole head' },
      { label: 'Battery', value: 'Box on the pole' },
    ],
    features: ['No grid connection', 'Dusk-to-dawn operation', 'Panel, battery and lamp in one assembly'],
  },
  {
    slug: 'solar-security-light',
    name: 'Solar security light',
    category: 'lighting',
    summary: 'A pole light with a camera, for yards and car parks.',
    description:
      'A sample solar security light for a car park or compound entrance. The panel and lamp sit on the pole, with a camera on the same shaft.',
    price: null,
    image: '/products/light-parking.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Mounting', value: 'Pole' },
      { label: 'Extras', value: 'Camera bracket' },
      { label: 'Use', value: 'Yards and car parks' },
    ],
    features: ['Lights the area without a trench to the grid', 'Camera can share the pole', 'Suited to entrances and parking rows'],
  },
  {
    slug: 'solar-garden-light',
    name: 'Solar garden light',
    category: 'lighting',
    summary: 'A small path light with the panel in the cap.',
    description:
      'A sample garden light. The solar cell is in the cap, so each stake charges itself and lights a path or flower bed after dark.',
    price: null,
    image: '/products/light-garden.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Mounting', value: 'Stake or short post' },
      { label: 'Panel', value: 'Built into the cap' },
      { label: 'Use', value: 'Paths and gardens' },
    ],
    features: ['No wiring between lights', 'Each unit charges itself', 'Low enough for paths and beds'],
  },
  {
    slug: 'solar-site-light',
    name: 'Solar site light tower',
    category: 'lighting',
    summary: 'A mobile tower with panels and flood lamps.',
    description:
      'A sample trailer-mounted light tower. Panels on the deck charge the unit, and the lamp head rises over a road works or a yard that has no supply yet.',
    price: null,
    image: '/products/px-9799708.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Form', value: 'Mobile tower' },
      { label: 'Lamps', value: 'Flood heads' },
      { label: 'Power', value: 'On-board solar' },
    ],
    features: ['Tow it to the job', 'No generator fuel for the lamps', 'Panels travel with the tower'],
  },
  {
    slug: 'home-solar-kit',
    name: 'Home solar kit',
    category: 'kits',
    summary: 'Panels, inverter and battery sized for a household.',
    description:
      'A sample home kit, illustrated by rooftop arrays on houses. It bundles panels, a hybrid inverter and a battery so a household does not have to piece the system together.',
    price: null,
    image: '/products/px-9875682.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Includes', value: 'Panels, inverter, battery, cabling' },
      { label: 'Suited to', value: 'A household' },
      { label: 'Installation', value: 'Available' },
    ],
    features: ['Sized to the appliances you list', 'One quote for the whole system', 'Roof layout agreed before work starts'],
  },
  {
    slug: 'business-solar-kit',
    name: 'Business solar kit',
    category: 'kits',
    summary: 'A roof array for a workshop, warehouse or factory.',
    description:
      'A sample business kit, shown as modules across a large industrial roof. It is aimed at daytime loads such as freezers, pumps and workshop tools.',
    price: null,
    image: '/products/panel-install.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Includes', value: 'Panels, hybrid inverter, battery bank' },
      { label: 'Suited to', value: 'Shops, workshops, warehouses' },
      { label: 'Installation', value: 'Available' },
    ],
    features: ['Cuts generator hours in the day', 'Laid out around roof lights and plant', 'Can be extended later'],
  },
  {
    slug: 'clinic-backup-kit',
    name: 'Clinic backup kit',
    category: 'kits',
    summary: 'A roof system installed for a building that cannot go dark.',
    description:
      'A sample kit for a clinic, school or office that needs power when the grid drops. The photograph shows a crew fixing modules on a roof, which is how this kit is delivered.',
    price: null,
    image: '/products/px-8853536.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Includes', value: 'Panels, inverter, battery, changeover' },
      { label: 'Suited to', value: 'Clinics and essential rooms' },
      { label: 'Installation', value: 'By our crew' },
    ],
    features: ['Keeps lights and a fridge running', 'Changeover without a scramble for fuel', 'Crew installs and hands over'],
  },
  {
    slug: 'estate-lighting-kit',
    name: 'Estate lighting kit',
    category: 'kits',
    summary: 'Solar pole lights for a yard, estate or works site.',
    description:
      'A sample lighting kit for a compound or yard. Several solar pole lights cover the open ground, each with its own panel, so there is no cable back to a meter.',
    price: null,
    image: '/products/light-perimeter.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Includes', value: 'Pole lights with panels' },
      { label: 'Suited to', value: 'Estates, yards, perimeters' },
      { label: 'Grid', value: 'Not required' },
    ],
    features: ['Each pole stands alone', 'Lights the yard after dusk', 'No trench back to the building'],
  },
  {
    slug: 'commercial-solar-kit',
    name: 'Commercial solar kit',
    category: 'kits',
    summary: 'A ground array sized and checked for a larger site.',
    description:
      'A sample commercial kit: a ground array large enough for a business park or a farm, surveyed before it is built. The photograph shows that check on a finished array.',
    price: null,
    image: '/products/px-4254167.jpg',
    featured: false,
    sample: true,
    specs: [
      { label: 'Includes', value: 'Array, inverter, mounting, survey' },
      { label: 'Suited to', value: 'Farms and commercial yards' },
      { label: 'Installation', value: 'Surveyed and installed' },
    ],
    features: ['Sized from your daytime load', 'Ground or roof, depending on the site', 'Handed over with a walkthrough'],
  },
]
