import { Product, HeroSlide, DepartmentCard, CurrencyConfig } from '../types/cricket';

// Base currency is BDT (৳). Verified conversion: 1 GBP = 160 BDT, 1 USD = 120 BDT.
export const CURRENCIES: Record<string, CurrencyConfig> = {
  BDT: { code: 'BDT', symbol: '৳', rate: 1.0, label: 'BDT (৳)' },
  USD: { code: 'USD', symbol: '$', rate: 1 / 120, label: 'USD ($)' },
  GBP: { code: 'GBP', symbol: '£', rate: 1 / 160, label: 'GBP (£)' },
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    title: 'KNYX CRICKET HELMETS',
    subtitle: 'সারাদেশে ক্যাশ অন ডেলিভারিতে পাওয়া যাচ্ছে',
    tagline: 'ULTIMATE TEMPLE & OCCIPITAL IMPACT DEFENCE FOR THE CREASE',
    desktopImage: 'https://www.prodirectsport.com/cdn/shop/files/SHOPIFY_Hero-Banner-D_Knyx_11026.jpg?v=1790854096',
    mobileImage: 'https://www.prodirectsport.com/cdn/shop/files/SHOPIFY_Hero-Banner-M_Knyx_11026.jpg?v=1790854097',
    buttonText: 'SHOP KNYX HELMETS',
    collectionLink: '/collections/cricket-adult-knyx-helmets',
    categoryFilter: 'Cricket Helmets'
  },
  {
    id: 'hero-2',
    title: 'DSC CRICKET BATS & GEAR',
    subtitle: 'POWER, PRECISION & ELITE ENGLISH WILLOW',
    tagline: 'FEATURING THE MASSIVE EDGES OF THE PEARLA & SPLIT PROFILE',
    desktopImage: 'https://www.prodirectsport.com/cdn/shop/files/Hero_Banner_Desktop_1.png?v=1783338006',
    mobileImage: 'https://www.prodirectsport.com/cdn/shop/files/Hero_Banner_Mobile_1.png?v=1783338011',
    buttonText: 'SHOP DSC BATS',
    collectionLink: '/collections/cricket-dsc-bats',
    categoryFilter: 'Cricket Bats'
  },
  {
    id: 'hero-3',
    title: 'CRICKET SPIKES & TURF SHOES',
    subtitle: 'ADIDAS, NEW BALANCE, PUMA & PAYNTR',
    tagline: 'GENUINE MATCHDAY FOOTWEAR DELIVERED DIRECTLY TO YOUR DOORSTEP ACROSS BANGLADESH',
    desktopImage: 'https://www.prodirectsport.com/cdn/shop/files/Hero_Banner_Desktop_5.jpg?v=1783431682',
    mobileImage: 'https://www.prodirectsport.com/cdn/shop/files/Hero_Banner_Mobile_2.jpg?v=1783431687',
    buttonText: 'EXPLORE FOOTWEAR',
    collectionLink: '/collections/cricket-adult-shoes',
    categoryFilter: 'Cricket Footwear'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: '1055203',
    title: 'adidas 22YDS Training Bowling Cricket Shoe',
    vendor: 'adidas',
    category: 'Cricket Footwear',
    department: 'Cricket Footwear',
    handle: 'adidas-22yds-training-bowling-cricket-shoe',
    price: 14400, // Converted at verified rate 1 GBP = 160 BDT (£90 * 160)
    oldPrice: 16000, // (£100 * 160)
    originalPriceGbp: 90.00,
    sizes: ['7', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    color: 'White/Aurora Onix/Core Black',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/1055203_main.jpg?v=1792326199&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/1055203_gallery_1.jpg?v=1792326199&width=800'
    ],
    description: 'Designed primarily for hard training surfaces and artificial turf, this edition of the 22YDS lets you steam into the crease with confidence, featuring a sturdy design with a midfoot strap for extra security as you complete your action. Ideal for Bangladesh club grounds and indoor net facilities.',
    franchise: 'Cricket Footwear',
    isNew: true,
    rating: 4.9,
    reviewsCount: 38,
    stock: 24,
    specs: {
      'Surface': 'Indoor & Artificial Turf',
      'Outsole': 'Herringbone Grip Rubber',
      'Midsole': 'Cushioned EVA + Torsion Stabilizer',
      'Fastening': 'Laces with Midfoot Lock Strap',
      'Availability': 'In Stock (Dhaka Hub)'
    }
  },
  {
    id: '1045195',
    title: 'New Balance CK4030 Cricket Shoe',
    vendor: 'New Balance',
    category: 'Cricket Footwear',
    department: 'Cricket Footwear',
    handle: 'new-balance-ck4030-cricket-shoe',
    price: 16000, // (£100 * 160)
    oldPrice: 21600, // (£135 * 160)
    originalPriceGbp: 100.00,
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    color: 'White/Red/Black',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/1045195_main.jpg?v=1791977292&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/1045195_gallery_1.jpg?v=1791977292&width=800'
    ],
    description: 'With a new moulded heel overlay, the New Balance CK4030 V6 Cricket Shoe offers a stable, secure fit that wraps the rear of the foot, minimising irritation as you move. FuelCell high rebound foam returns in the midsole.',
    franchise: 'Cricket Footwear',
    isExclusive: true,
    rating: 4.8,
    reviewsCount: 29,
    stock: 18,
    specs: {
      'Spike Configuration': '7/4 Metal Spikes with TPU Plate',
      'Cushioning': 'FuelCell Ultra Rebound Foam',
      'Upper': 'Engineered Mesh with Protective PU Film',
      'Availability': 'In Stock (Dhaka Hub)'
    }
  },
  {
    id: '4004056',
    title: 'Puma evoSPEED 24.1 Cricket Shoe',
    vendor: 'Puma',
    category: 'Cricket Footwear',
    department: 'Cricket Footwear',
    handle: 'puma-evospeed-241-cricket-shoe',
    price: 16000, // (£100 * 160)
    oldPrice: 17920, // (£112 * 160)
    originalPriceGbp: 100.00,
    sizes: ['7', '8', '9', '10', '11', '12'],
    color: 'White/Speed Blue/Fizzy Light',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/4004056_main.jpg?v=1791068918&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/4004056_gallery_1.jpg?v=1791068918&width=800'
    ],
    description: 'Upgraded for the modern cricket game, the 24.1 edition features a cross-over mesh tongue for a snug, distraction-free fit, with ProFoamLite cushioning to absorb impact during long bowling spells.',
    franchise: 'Cricket Footwear',
    rating: 4.7,
    reviewsCount: 19,
    stock: 15,
    specs: {
      'Midsole': 'ProFoamLite High-Rebound EVA',
      'Flex': 'Forefoot Articulated Flex Grooves',
      'Traction': 'Multi-Surface Hybrid Spikes',
      'Availability': 'In Stock (Dhaka Hub)'
    }
  },
  {
    id: '1031064',
    title: 'Payntr Pro-X Club Cricket Shoe',
    vendor: 'Payntr',
    category: 'Cricket Footwear',
    department: 'Cricket Footwear',
    handle: 'payntr-pro-x-club-cricket-shoe',
    price: 13200, // (£82.50 * 160)
    oldPrice: 17600, // (£110 * 160)
    originalPriceGbp: 82.50,
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    color: 'White/Blue/Yellow',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/1031064_main.jpg?v=1792172869&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/1031064_gallery_1.jpg?v=1792172869&width=800'
    ],
    description: 'A modern cricket shoe built to withstand the rigours of today\'s game, the Pro-X Club offers the ideal mix of stability, comfort, and grip. Great choice for all-rounders.',
    franchise: 'Cricket Footwear',
    rating: 4.6,
    reviewsCount: 15,
    stock: 20,
    specs: {
      'Insole': 'Memory Foam Footbed',
      'Toe Protection': 'Reinforced Rubber Scuff Guard',
      'Availability': 'In Stock (Dhaka Hub)'
    }
  },
  {
    id: '1028799',
    title: 'Gunn & Moore Verva 404 Cricket Bat',
    vendor: 'Gunn & Moore',
    category: 'Cricket Bats',
    department: 'Cricket Bats',
    handle: 'gunn-moore-verva-404-cricket-bat',
    price: 19200, // (£120 * 160)
    oldPrice: 25600, // (£160 * 160)
    originalPriceGbp: 120.00,
    sizes: ['Short Handle (Light)', 'Short Handle (Med)', 'Harrow'],
    color: 'Green/Black',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/1028799_main.jpg?v=1789136779&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/1028799_gallery_1.jpg?v=1789136779&width=800'
    ],
    description: 'Crafted for confident, attacking cricket, the Verva sees more willow distributed towards the toe of the bat, giving boundless power to big boundary hits. Features a shorter L540 blade for rapid hand speed.',
    franchise: 'Cricket Bats',
    isNew: true,
    rating: 4.9,
    reviewsCount: 42,
    stock: 12,
    specs: {
      'Willow Grade': 'Seasoned Grade 4 English Willow',
      'Blade Length': 'Shorter L540 Blade for Rapid Hand Speed',
      'Sweet Spot': 'Mid to Low Swell for Attacking Strikes',
      'Preparation': 'Pre-knocked, Oiled and Extratec Fitted'
    }
  },
  {
    id: '4001355',
    title: 'adidas Incurza Heat Pro Cricket Bat',
    vendor: 'adidas',
    category: 'Cricket Bats',
    department: 'Cricket Bats',
    handle: 'adidas-incurza-heat-pro-cricket-bat',
    price: 44800, // (£280 * 160)
    oldPrice: 56000, // (£350 * 160)
    originalPriceGbp: 280.00,
    sizes: ['Short Handle (Light)', 'Short Handle (Med)'],
    color: 'Black/Lucid Tangerine',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/4001355_main.jpg?v=1791246572&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/4001355_gallery_1.jpg?v=1791246572&width=800'
    ],
    description: 'The hugely popular Incurza series returns with bold styling and aggressive attitude. Engineered for dynamic strokeplay with a mid-low sweetspot and extended power swell for boundary clearing.',
    franchise: 'Cricket Bats',
    isExclusive: true,
    rating: 5.0,
    reviewsCount: 56,
    stock: 6,
    specs: {
      'Willow Grade': 'Selected Grade 1 English Willow',
      'Edges': 'Massive 38-40mm Full Power Contours',
      'Profile': 'Bowed Blade for Front-Foot Dominance'
    }
  },
  {
    id: '1050005',
    title: 'DSC Pearla X4 Cricket Bat',
    vendor: 'DSC',
    category: 'Cricket Bats',
    department: 'Cricket Bats',
    handle: 'dsc-pearla-x4-cricket-bat',
    price: 25600, // (£160 * 160)
    oldPrice: 32800, // (£205 * 160)
    originalPriceGbp: 160.00,
    sizes: ['Short Handle', 'Harrow', 'Size 6'],
    color: 'White/Black',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/1050005_main.jpg?v=1789155996&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/1050005_gallery_1.jpg?v=1789155996&width=800'
    ],
    description: 'With massive edges throughout the entire middle of the bat, the Pearla X gives you greater power and control for any type of shot. Light pickup with high ping.',
    franchise: 'Cricket Bats',
    rating: 4.8,
    reviewsCount: 21,
    stock: 16,
    specs: {
      'Willow Grade': 'Premium Grade 3 English Willow',
      'Handle': 'Multi-Piece Round Cane Handle',
      'Toe Guard': 'Factory Pre-fitted Rubber Toe'
    }
  },
  {
    id: '4012944',
    title: 'Gunn & Moore Diamond Ben Stokes 55 Cricket Bat',
    vendor: 'Gunn & Moore',
    category: 'Cricket Bats',
    department: 'Cricket Bats',
    handle: 'gm-diamond-ben-stokes-55-cricket-bat',
    price: 88800, // (£555 * 160)
    oldPrice: null,
    originalPriceGbp: 555.00,
    sizes: ['Short Handle (2lb 9oz)', 'Short Handle (2lb 10oz)'],
    color: 'White/Electric Blue/Navy',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/4012944_main.jpg?v=1789300399&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/4012944_gallery_1.jpg?v=1789300399&width=800'
    ],
    description: 'Trusted and personally wielded by England Test Captain Ben Stokes. Crafted in Nottingham, England from the top 1% of unbleached Grade 1+ English Willow clefts. The shorter L540 blade paired with an extended sweet spot delivers exceptional pick-up and lethal punch.',
    franchise: 'Ben Stokes Collection',
    isExclusive: true,
    isNew: true,
    rating: 5.0,
    reviewsCount: 88,
    stock: 4,
    specs: {
      'Willow Grade': 'Limited Edition Unbleached Grade 1+ English Willow',
      'Crafted in': 'Nottingham, England (GM DXM Precision Machined)',
      'Handle': 'Specially selected Treble Spring Cane',
      'Profile': 'Ben Stokes Match Edition Custom Curve'
    }
  },
  {
    id: '4012945',
    title: 'Gunn & Moore Diamond 808 Cricket Bat',
    vendor: 'Gunn & Moore',
    category: 'Cricket Bats',
    department: 'Cricket Bats',
    handle: 'gm-diamond-808-cricket-bat',
    price: 42000, // (£262.50 * 160)
    oldPrice: 56000, // (£350 * 160)
    originalPriceGbp: 262.50,
    sizes: ['Short Handle (Light)', 'Short Handle (Medium)'],
    color: 'White/Cyan/Black',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/4012944_main.jpg?v=1789300399&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/1050203_thumbnail.jpg?v=1791973772&width=800'
    ],
    description: 'Built to the same Diamond silhouette designed in conjunction with Ben Stokes, the 808 model provides magnificent performance using seasoned Grade 2 English Willow.',
    franchise: 'Ben Stokes Collection',
    rating: 4.8,
    reviewsCount: 34,
    stock: 9,
    specs: {
      'Willow Grade': 'Superior Seasoned Grade 2 English Willow',
      'Edges': '38mm contoured side walls',
      'Finish': 'Extratec protective sheet applied'
    }
  },
  {
    id: '1011063',
    title: 'Kookaburra T20 6.1 Ambi Batting Pads',
    vendor: 'Kookaburra',
    category: 'Batting Pads',
    department: 'Batting Pads',
    handle: 'kookaburra-t20-61-ambi-batting-pads',
    price: 5920, // (£37 * 160)
    oldPrice: 8000, // (£50 * 160)
    originalPriceGbp: 37.00,
    sizes: ['Adults', 'Youth', 'Junior'],
    color: 'Black/White',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/1011063_main.jpg?v=1791785380&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/1011063_gallery_1.jpg?v=1791785380&width=800'
    ],
    description: 'The Kookaburra T20 6.1 Ambidextrous Batting Pads combine high-density shock foam with traditional cane rods and a grain PVC face for dependable barrier defense.',
    franchise: 'Batting Equipment',
    rating: 4.7,
    reviewsCount: 18,
    stock: 35,
    specs: {
      'Handedness': 'Ambidextrous (Left or Right Handed)',
      'Shin Bolster': 'Breathable Mesh Bolster',
      'Straps': '3 Wide Brushed Comfort Straps'
    }
  },
  {
    id: '198547',
    title: 'Chase FLC RH Batting Pads',
    vendor: 'Chase',
    category: 'Batting Pads',
    department: 'Batting Pads',
    handle: 'chase-flc-rh-batting-pads',
    price: 19840, // (£124 * 160)
    oldPrice: 24800, // (£155 * 160)
    originalPriceGbp: 124.00,
    sizes: ['Adults RH', 'Mens RH'],
    color: 'White/Silver',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/198547_main.jpg?v=1790847345&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/198547_gallery_1.jpg?v=1790847345&width=800'
    ],
    description: 'The elegant silver badging on the Chase FLC Right-Handed Pads gives a sleek minimalist aesthetic. Packed with test-grade ultra-dense foam.',
    franchise: 'Batting Equipment',
    isExclusive: true,
    rating: 5.0,
    reviewsCount: 16,
    stock: 14,
    specs: {
      'Protection Standard': 'Test Match Protection Grade',
      'Weight': 'Featherlight High-Density Polymer Core',
      'Knee Locator': 'Gel-Enclosed Anatomical Cup'
    }
  },
  {
    id: '4012946',
    title: 'Gunn & Moore Diamond 404 RH Batting Pads',
    vendor: 'Gunn & Moore',
    category: 'Batting Pads',
    department: 'Batting Pads',
    handle: 'gm-diamond-404-rh-batting-pads',
    price: 6720, // (£42 * 160)
    oldPrice: 11200, // (£70 * 160)
    originalPriceGbp: 42.00,
    sizes: ['Adults RH', 'Youth RH'],
    color: 'White/Blue',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/1011063_main.jpg?v=1791785380&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/1045106_thumbnail.jpg?v=1792172006&width=800'
    ],
    description: 'Ben Stokes signature Diamond collection leg guards. Engineered with vertical cane ribbing and sculpted knee rolls for total mobility.',
    franchise: 'Ben Stokes Collection',
    rating: 4.8,
    reviewsCount: 22,
    stock: 22,
    specs: {
      'Bolsters': 'Tri-fold Low Density Foam',
      'Facing': 'Heavy Duty PVC Facing',
      'Instep': 'Padded Mesh Instep Protection'
    }
  },
  {
    id: '4003032',
    title: 'Castore England T20 Replica Long Sleeve Shirt',
    vendor: 'Castore',
    category: 'Cricket Clothing',
    department: 'Cricket Clothing',
    handle: 'castore-england-t20-replica-long-sleeve-shirt',
    price: 10240, // (£64 * 160)
    oldPrice: 12800, // (£80 * 160)
    originalPriceGbp: 64.00,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    color: 'Fiery Red/Princess Blue',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/4003032_main.jpg?v=1790171500&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/4003032_gallery_1.jpg?v=1790171500&width=800'
    ],
    description: 'Made from high-performance breathable fabric, the replica edition of the England T20 Long Sleeve Shirt keeps you cool on and off the field.',
    franchise: 'Cricket Clothing',
    isNew: true,
    rating: 4.9,
    reviewsCount: 45,
    stock: 25,
    specs: {
      'Material': '100% Lightweight Aerodynamic Poly',
      'Sleeve': 'Long Sleeve with Athletic Cuffs',
      'Fit': 'Athletic Matchday Fit'
    }
  },
  {
    id: '4003042',
    title: 'Castore England Training Poly Polo',
    vendor: 'Castore',
    category: 'Cricket Clothing',
    department: 'Cricket Clothing',
    handle: 'castore-england-training-poly-polo',
    price: 6144, // (£38.40 * 160)
    oldPrice: 7680, // (£48 * 160)
    originalPriceGbp: 38.40,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    color: 'Ensign Blue/Airy Blue',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/4003042_main.jpg?v=1790531503&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/4003042_gallery_1.jpg?v=1790531503&width=800'
    ],
    description: 'As worn by international players during pre-match warmups and net practice. Features raglan sleeves for overhead bowling articulation.',
    franchise: 'Cricket Clothing',
    rating: 4.6,
    reviewsCount: 14,
    stock: 20,
    specs: {
      'Fit': 'Slim Athletic Match Fit',
      'Fabric': 'Breathable Micro Pique',
      'Collar': 'Ribbed 2-Button Placket'
    }
  },
  {
    id: '4012947',
    title: 'Gunn & Moore Diamond Wheelie Bag',
    vendor: 'Gunn & Moore',
    category: 'Cricket Bags',
    department: 'Cricket Bags',
    handle: 'gm-diamond-wheelie-bag',
    price: 5920, // (£37 * 160)
    oldPrice: 7360, // (£46 * 160)
    originalPriceGbp: 37.00,
    sizes: ['Standard (90L)'],
    color: 'Black/Teal/White',
    images: [
      'https://www.prodirectsport.com/cdn/shop/files/1044249_thumbnail.jpg?v=1789911455&width=800',
      'https://www.prodirectsport.com/cdn/shop/files/1048935_thumbnail.jpg?v=1791735551&width=800'
    ],
    description: 'Spacious 90-litre cricket bag with rugged all-terrain wheels and reinforced base runners. Includes an internal padded bat pocket that keeps your prized willow protected.',
    franchise: 'Ben Stokes Collection',
    rating: 4.7,
    reviewsCount: 28,
    stock: 14,
    specs: {
      'Volume': '90 Litres Storage',
      'Wheels': 'Heavy-Duty Ball Bearing Wheels',
      'Material': '600D Tear-Resistant Polyester'
    }
  }
];

export const DEPARTMENTS: DepartmentCard[] = [
  {
    id: 'dept-bats',
    name: 'Cricket Bats',
    subtitle: 'English Willow & Training Bats',
    image: 'https://www.prodirectsport.com/cdn/shop/files/Ben_Stokes_Bat_100926.jpg?v=1789034878&width=800',
    categoryFilter: 'Cricket Bats',
    itemCount: 48
  },
  {
    id: 'dept-shoes',
    name: 'Cricket Footwear',
    subtitle: 'Spikes & Turf Trainers',
    image: 'https://www.prodirectsport.com/cdn/shop/files/1055203_main.jpg?v=1792326199&width=800',
    categoryFilter: 'Cricket Footwear',
    itemCount: 36
  },
  {
    id: 'dept-batting',
    name: 'Batting Pads',
    subtitle: 'High Density Leg Guards',
    image: 'https://www.prodirectsport.com/cdn/shop/files/1011063_main.jpg?v=1791785380&width=800',
    categoryFilter: 'Batting Pads',
    itemCount: 52
  },
  {
    id: 'dept-protection',
    name: 'Cricket Helmets',
    subtitle: 'BS Certified Safety at the Crease',
    image: 'https://www.prodirectsport.com/cdn/shop/files/SHOPIFY_Hero-Banner-M_Knyx_11026.jpg?v=1790854097&width=800',
    categoryFilter: 'Cricket Helmets',
    itemCount: 24
  },
  {
    id: 'dept-clothing',
    name: 'Cricket Clothing',
    subtitle: 'Jerseys, Whites & Training Kit',
    image: 'https://www.prodirectsport.com/cdn/shop/files/4003032_main.jpg?v=1790171500&width=800',
    categoryFilter: 'Cricket Clothing',
    itemCount: 31
  },
  {
    id: 'dept-bags',
    name: 'Cricket Bags',
    subtitle: 'Wheelies, Duffles & Bat Sleeves',
    image: 'https://www.prodirectsport.com/cdn/shop/files/1044249_thumbnail.jpg?v=1789911455&width=800',
    categoryFilter: 'Cricket Bags',
    itemCount: 18
  }
];

export const BRANDS = [
  { name: 'Gunn & Moore', count: 18 },
  { name: 'adidas', count: 12 },
  { name: 'DSC', count: 9 },
  { name: 'New Balance', count: 14 },
  { name: 'Puma', count: 8 },
  { name: 'Payntr', count: 6 },
  { name: 'Kookaburra', count: 16 },
  { name: 'Chase', count: 7 },
  { name: 'Castore', count: 11 },
  { name: 'Gray-Nicolls', count: 22 }
];

export const PROMO_ANNOUNCEMENTS = [
  { text: 'সারাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা', icon: 'truck' },
  { text: 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টার মধ্যে সুপারফাস্ট ডেলিভারি', icon: 'clock' },
  { text: '৳৫,০০০ বা তার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি', icon: 'zap' },
  { text: '১০০% অরিজিনাল ক্রিকেট গিয়ার ও অফিসিয়াল উইলো গ্যারান্টি', icon: 'award' }
];
