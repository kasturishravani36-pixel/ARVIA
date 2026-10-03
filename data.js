const IMG = (seed, w = 800, h = 1000) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const CATEGORIES = [
  { slug: 'paintings',   name: 'Paintings' },
  { slug: 'photography', name: 'Photography' },
  { slug: 'sculpture',   name: 'Sculpture' },
  { slug: 'prints',      name: 'Prints & Editions' },
  { slug: 'ceramics',    name: 'Ceramics' },
  { slug: 'textiles',    name: 'Textiles' },
  { slug: 'jewelry',     name: 'Jewelry' },
  { slug: 'woodwork',    name: 'Woodwork' },
];

const ARTISTS = [
  { id:'a1', slug:'mara-ellison',  name:'Mara Ellison',  location:'Lisbon, Portugal',   bio:'Layered oil landscapes built from memory and coastal light.' },
  { id:'a2', slug:'jonas-reyes',   name:'Jonas Reyes',   location:'Mexico City, MX',    bio:'Large-format photography of quiet, overlooked places.' },
  { id:'a3', slug:'aiko-tanaka',   name:'Aiko Tanaka',    location:'Kyoto, Japan',      bio:'Wheel-thrown stoneware with natural ash and iron glazes.' },
  { id:'a4', slug:'elias-brandt',  name:'Elias Brandt',   location:'Berlin, Germany',   bio:'Cast and carved figures exploring weight and balance.' },
  { id:'a5', slug:'nadia-rahman',  name:'Nadia Rahman',   location:'London, UK',        bio:'Hand-pulled risograph and screen prints in small editions.' },
  { id:'a6', slug:'sofia-marin',   name:'Sofia Marín',    location:'Oaxaca, Mexico',    bio:'Naturally dyed textiles woven on a floor loom.' },
  { id:'a7', slug:'hana-okafor',   name:'Hana Okafor',    location:'Portland, USA',     bio:'Functional woodwork in locally salvaged hardwoods.' },
];

const PRODUCTS = [
  { id:'p1',  seq:1,  slug:'ochre-horizon-i',   title:'Ochre Horizon I',      artistId:'a1', category:'paintings',   price:1850, mine:true,  featured:true,  badge:'Original', medium:'Oil on linen',        dimensions:'80 × 60 cm', year:2025, images:['arvia-p1-1','arvia-p1-2','arvia-p1-3'], description:'A low, luminous horizon painted in warm earth pigments — built up in thin glazes over six weeks.' },
  { id:'p2',  seq:2,  slug:'quiet-tide',       title:'Quiet Tide',           artistId:'a1', category:'paintings',   price:2200, mine:true,  featured:false, badge:'Original', medium:'Oil on canvas',       dimensions:'100 × 70 cm', year:2025, images:['arvia-p2-1','arvia-p2-2','arvia-p2-3'], description:'Tidal blues and greys dissolving into a pale shoreline, painted from sketches made at dawn.' },
  { id:'p3',  seq:3,  slug:'fields-at-dusk',   title:'Fields at Dusk',       artistId:'a1', category:'paintings',   price:1450, mine:false, featured:false, badge:'Original', medium:'Oil on panel',        dimensions:'60 × 45 cm', year:2024, images:['arvia-p3-1','arvia-p3-2','arvia-p3-3'], description:'The last light over harvested fields, rendered in muted greens and burnt umber.' },
  { id:'p4',  seq:4,  slug:'nocturne-no-4',    title:'Nocturne No. 4',       artistId:'a1', category:'paintings',   price:1980, mine:true,  featured:false, badge:'Original', medium:'Oil and cold wax',    dimensions:'90 × 70 cm', year:2025, images:['arvia-p4-1','arvia-p4-2','arvia-p4-3'], description:'A dark, textured night piece with light breaking through in a single band.' },
  { id:'p5',  seq:5,  slug:'concrete-bloom',   title:'Concrete Bloom',       artistId:'a2', category:'photography', price:620,  mine:false, featured:true,  badge:'Edition of 25', medium:'Archival pigment print', dimensions:'50 × 40 cm', year:2024, images:['arvia-p5-1','arvia-p5-2','arvia-p5-3'], description:'Wild growth pushing through a parking structure — part of the Soft City series.' },
  { id:'p6',  seq:6,  slug:'northern-quiet',   title:'Northern Quiet',       artistId:'a2', category:'photography', price:480,  mine:false, featured:false, badge:'Edition of 30', medium:'Archival pigment print', dimensions:'40 × 30 cm', year:2024, images:['arvia-p6-1','arvia-p6-2','arvia-p6-3'], description:'Fog over a northern lake, shot on medium format film and printed by hand.' },
  { id:'p7',  seq:7,  slug:'salt-flats-6am',   title:'Salt Flats, 6am',      artistId:'a2', category:'photography', price:750,  mine:true,  featured:false, badge:'Edition of 15', medium:'Archival pigment print', dimensions:'70 × 50 cm', year:2025, images:['arvia-p7-1','arvia-p7-2','arvia-p7-3'], description:'First light across cracked salt — a study in near-monochrome pink and white.' },
  { id:'p8',  seq:8,  slug:'vessel-form-ii',   title:'Vessel Form II',       artistId:'a3', category:'ceramics',    price:340,  mine:false, featured:true,  badge:'One of a kind', medium:'Wheel-thrown stoneware', dimensions:'28 cm tall', year:2025, images:['arvia-p8-1','arvia-p8-2','arvia-p8-3'], description:'An asymmetrical vessel with a matte iron glaze that breaks to bronze on the rim.' },
  { id:'p9',  seq:9,  slug:'ash-glaze-tea-bowl', title:'Ash Glaze Tea Bowl', artistId:'a3', category:'ceramics',    price:180,  mine:false, featured:false, badge:'One of a kind', medium:'Stoneware, natural ash glaze', dimensions:'12 cm diameter', year:2025, images:['arvia-p9-1','arvia-p9-2','arvia-p9-3'], description:'A chawan with a running ash glaze, wood-fired and completely unique.' },
  { id:'p10', seq:10, slug:'folded-earth',      title:'Folded Earth',         artistId:'a3', category:'ceramics',    price:420,  mine:false, featured:false, badge:'Set of 3', medium:'Porcelain, matte glaze', dimensions:'9–14 cm tall', year:2024, images:['arvia-p10-1','arvia-p10-2','arvia-p10-3'], description:'Three folded porcelain forms in bone, clay and slate tones.' },
  { id:'p11', seq:11, slug:'standing-figure',   title:'Standing Figure',      artistId:'a4', category:'sculpture',   price:3400, mine:false, featured:true,  badge:'Original', medium:'Cast bronze',         dimensions:'52 cm tall', year:2024, images:['arvia-p11-1','arvia-p11-2','arvia-p11-3'], description:'A patinated bronze figure balanced on a single point — the artist’s most exhibited work.' },
  { id:'p12', seq:12, slug:'small-bronze-no-7', title:'Small Bronze No. 7',   artistId:'a4', category:'sculpture',   price:1250, mine:false, featured:false, badge:'Edition of 8', medium:'Cast bronze',         dimensions:'24 cm tall', year:2025, images:['arvia-p12-1','arvia-p12-2','arvia-p12-3'], description:'A compact study in mass and negative space, editioned to eight.' },
  { id:'p13', seq:13, slug:'solstice',          title:'Solstice',             artistId:'a5', category:'prints',      price:220,  mine:true,  featured:true,  badge:'Edition of 50', medium:'Screen print, 4 colours', dimensions:'50 × 70 cm', year:2025, images:['arvia-p13-1','arvia-p13-2','arvia-p13-3'], description:'Four-colour screen print of overlapping solar forms, signed and numbered.' },
  { id:'p14', seq:14, slug:'botanic-study-set', title:'Botanic Study Set',   artistId:'a5', category:'prints',      price:160,  mine:false, featured:false, badge:'Set of 3', medium:'Risograph prints',    dimensions:'30 × 40 cm each', year:2024, images:['arvia-p14-1','arvia-p14-2','arvia-p14-3'], description:'Three botanical studies in soy-based inks — fern, thistle and cow parsley.' },
  { id:'p15', seq:15, slug:'riso-grid',         title:'Riso Grid',            artistId:'a5', category:'prints',      price:95,   mine:false, featured:false, badge:'Open edition', medium:'Risograph print',     dimensions:'42 × 30 cm', year:2025, images:['arvia-p15-1','arvia-p15-2','arvia-p15-3'], description:'A geometric grid in fluorescent orange and blue, printed on heavyweight stock.' },
  { id:'p16', seq:16, slug:'indigo-weave',      title:'Indigo Weave',         artistId:'a6', category:'textiles',    price:890,  mine:true,  featured:true,  badge:'Original', medium:'Handwoven cotton, natural indigo', dimensions:'120 × 80 cm', year:2025, images:['arvia-p16-1','arvia-p16-2','arvia-p16-3'], description:'A wall hanging woven floor-loom with plant-dyed indigo in eleven tones.' },
  { id:'p17', seq:17, slug:'linen-wall-hanging', title:'Linen Wall Hanging', artistId:'a6', category:'textiles',    price:540,  mine:false, featured:false, badge:'Original', medium:'Handwoven linen',     dimensions:'100 × 60 cm', year:2024, images:['arvia-p17-1','arvia-p17-2','arvia-p17-3'], description:'Undyed linen with a subtle herringbone structure and hand-knotted fringe.' },
  { id:'p18', seq:18, slug:'hammered-cuff',     title:'Hammered Cuff',        artistId:'a7', category:'jewelry',     price:260,  mine:false, featured:false, badge:'One of a kind', medium:'Hand-hammered brass', dimensions:'Adjustable', year:2025, images:['arvia-p18-1','arvia-p18-2','arvia-p18-3'], description:'A wide brass cuff with a faceted, light-catching hammered surface.' },
  { id:'p19', seq:19, slug:'silver-drop-earrings', title:'Silver Drop Earrings', artistId:'a7', category:'jewelry', price:145, mine:false, featured:false, badge:'Pair', medium:'Recycled sterling silver', dimensions:'4.5 cm drop', year:2025, images:['arvia-p19-1','arvia-p19-2','arvia-p19-3'], description:'Liquid-looking silver drops on Sterling hooks, polished to a mirror finish.' },
  { id:'p20', seq:20, slug:'walnut-catchall',   title:'Walnut Catchall',      artistId:'a7', category:'woodwork',    price:190,  mine:false, featured:false, badge:'One of a kind', medium:'Solid black walnut, oil finish', dimensions:'26 × 14 cm', year:2025, images:['arvia-p20-1','arvia-p20-2','arvia-p20-3'], description:'A hand-carved tray in solid black walnut with a soft, oiled finish.' },
];

const SAMPLE_ORDERS = [
  { id:'ARV-482193', date:'2025-05-12', status:'Delivered', total:1240, items:[{ title:'Ochre Horizon I', qty:1, price:1240, img:'arvia-p1-1' }] },
  { id:'ARV-471055', date:'2025-03-28', status:'Delivered', total:340,  items:[{ title:'Vessel Form II', qty:1, price:340, img:'arvia-p8-1' }] },
  { id:'ARV-468712', date:'2025-02-04', status:'Delivered', total:315,  items:[{ title:'Solstice', qty:1, price:220, img:'arvia-p13-1' }, { title:'Riso Grid', qty:1, price:95, img:'arvia-p15-1' }] },
];

const SAMPLE_SELLER_ORDERS = [
  { id:'ARV-490211', buyer:'L. Foster',  item:'Quiet Tide',        total:2200, status:'To ship' },
  { id:'ARV-489847', buyer:'M. Chen',    item:'Solstice',          total:220,  status:'Shipped' },
  { id:'ARV-488015', buyer:'R. Osei',    item:'Indigo Weave',      total:890,  status:'Shipped' },
  { id:'ARV-487522', buyer:'A. Petrova', item:'Salt Flats, 6am',   total:750,  status:'Delivered' },
];

const SAMPLE_REVENUE = [820, 940, 1180, 1020, 1460, 1710, 1390, 1840, 2120, 1960, 2380, 2640];
const CHART_MONTHS = ['J','F','M','A','M','J','J','A','S','O','N','D'];
