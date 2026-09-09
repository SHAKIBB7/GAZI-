export interface CricketProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: {
    name: string;
    slug: string;
    country: string;
    logoUrl?: string;
  };
  category: {
    name: string;
    slug: string;
  };
  player?: {
    name: string;
    slug: string;
    country: string;
    role: string;
    avatarUrl: string;
  };
  basePrice: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  shortDescription: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFlashSale?: boolean;
  stock: number;
  hasKnockingOption?: boolean;
  // Cricket Bat Specifics (if category is Cricket Bats)
  batSpecs?: {
    willowGrade: string;
    grainCount: number;
    weightOz: number; // e.g., 43.2 oz (2lb 11.2oz)
    sweetSpot: "Low" | "Mid" | "Mid-to-High" | "High";
    edgeThickness: string; // e.g. "39mm"
    spineHeight: string; // e.g. "65mm"
    handleType: "Round" | "Semi-Oval" | "Oval";
    sizesAvailable: string[];
  };
}

export const CRICKET_BRANDS = [
  { name: "Kookaburra", slug: "kookaburra", country: "Australia", origin: "Melbourne, Australia" },
  { name: "Gray-Nicolls", slug: "gray-nicolls", country: "England", origin: "Robertsbridge, UK" },
  { name: "SS (Sareen Sports)", slug: "ss", country: "India", origin: "Meerut, India" },
  { name: "CA Sports", slug: "ca", country: "Pakistan", origin: "Sialkot, Pakistan" },
  { name: "MRF", slug: "mrf", country: "India", origin: "Chennai, India" },
  { name: "SG (Sanspareils Greenlands)", slug: "sg", country: "India", origin: "Meerut, India" },
  { name: "DSC (Delux Sports)", slug: "dsc", country: "India", origin: "Jalandhar, India" },
  { name: "New Balance", slug: "new-balance", country: "USA / UK", origin: "Global" },
];

export const CRICKET_PLAYERS = [
  {
    name: "Shakib Al Hasan",
    slug: "shakib-al-hasan",
    country: "Bangladesh",
    role: "All-Rounder",
    avatarUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80",
    endorsedBrand: "SS / SG",
    weapon: "SS Master 9000 English Willow Bat",
  },
  {
    name: "Virat Kohli",
    slug: "virat-kohli",
    country: "India",
    role: "Top-order Batter",
    avatarUrl: "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=400&q=80",
    endorsedBrand: "MRF",
    weapon: "MRF Genius Grand Edition English Willow",
  },
  {
    name: "Babar Azam",
    slug: "babar-azam",
    country: "Pakistan",
    role: "Top-order Batter",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    endorsedBrand: "Gray-Nicolls",
    weapon: "Gray-Nicolls Hypernova 1.3 5-Star Bat",
  },
  {
    name: "Joe Root",
    slug: "joe-root",
    country: "England",
    role: "Top-order Batter",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    endorsedBrand: "New Balance",
    weapon: "New Balance TC 1260 English Willow Bat",
  },
];

export const CRICKET_CATEGORIES = [
  {
    name: "Cricket Bats",
    slug: "cricket-bats",
    count: 48,
    image: "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=600&q=80",
    subcategories: ["English Willow", "Kashmir Willow", "Tennis Bat", "Training Bat"],
  },
  {
    name: "Cricket Balls",
    slug: "cricket-balls",
    count: 24,
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Leather 4-Piece", "White Match Ball", "Pink Day/Night", "Tennis & Wind Balls"],
  },
  {
    name: "Batting Equipment",
    slug: "batting-equipment",
    count: 65,
    image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Batting Gloves", "Leg Guards / Pads", "Helmets", "Arm & Thigh Guards"],
  },
  {
    name: "Wicket Keeping",
    slug: "wicket-keeping",
    count: 18,
    image: "https://images.unsplash.com/photo-1593766788306-2856e052d3e8?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Keeping Gloves", "Keeping Pads", "Inner Chamois Gloves"],
  },
  {
    name: "Cricket Shoes & Spikes",
    slug: "cricket-shoes",
    count: 32,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Full Metal Spikes", "Half Spikes / All Rounder", "Turf & Rubber Studs"],
  },
  {
    name: "Team Kits & Clothing",
    slug: "clothing",
    count: 40,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Custom Team Jerseys", "White Test Kit", "Compression Sleeves", "Cricket Caps"],
  },
  {
    name: "Kit Bags & Accessories",
    slug: "accessories",
    count: 55,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Wheelie Duffle Bags", "Bat Grips & Cones", "Linseed Oil & Knocking Mallets"],
  },
  {
    name: "Training & Ground Gear",
    slug: "training-equipment",
    count: 22,
    image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Sidearm Pro Throwers", "Bowling Machines", "Spring Stumps", "Catching Ramps"],
  },
];

export const CRICKET_PRODUCTS: CricketProduct[] = [
  {
    id: "prod-1",
    name: "Kookaburra Kahuna Pro English Willow Cricket Bat 2026",
    slug: "kookaburra-kahuna-pro-english-willow-2026",
    sku: "KB-KAH-PRO-26",
    brand: { name: "Kookaburra", slug: "kookaburra", country: "Australia" },
    category: { name: "Cricket Bats", slug: "cricket-bats" },
    basePrice: 42000,
    discountPrice: 38500,
    rating: 4.9,
    reviewCount: 42,
    images: [
      "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=800&q=80",
    ],
    shortDescription: "Iconic lime green graphics, Grade 1+ unbleached English willow with massive 40mm power edges.",
    description: "The flagship Kahuna Pro is crafted from the world's finest hand-selected Grade 1+ English Willow. Used by elite international power-hitters, it delivers explosive stroke play with a mid-blade sweet spot and minimal concaving.",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    stock: 12,
    hasKnockingOption: true,
    batSpecs: {
      willowGrade: "Grade 1+ Hand-Selected English Willow",
      grainCount: 11,
      weightOz: 43.5, // ~ 2lb 11.5oz
      sweetSpot: "Mid",
      edgeThickness: "40mm",
      spineHeight: "66mm",
      handleType: "Oval",
      sizesAvailable: ["Short Handle (SH)", "Long Handle (LH)"],
    },
  },
  {
    id: "prod-2",
    name: "SS Master 9000 Player Edition Bat (Shakib Special)",
    slug: "ss-master-9000-player-edition",
    sku: "SS-MST-9000",
    brand: { name: "SS (Sareen Sports)", slug: "ss", country: "India" },
    category: { name: "Cricket Bats", slug: "cricket-bats" },
    player: {
      name: "Shakib Al Hasan",
      slug: "shakib-al-hasan",
      country: "Bangladesh",
      role: "All-Rounder",
      avatarUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80",
    },
    basePrice: 34000,
    discountPrice: 29900,
    rating: 4.8,
    reviewCount: 38,
    images: [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=800&q=80",
    ],
    shortDescription: "Endorsed and tailored to the profile preferred by Bangladesh champion Shakib Al Hasan.",
    description: "Specially designed for feather-light pickup and quick wrists, the SS Master 9000 offers immaculate balance, 8-10 straight clean grains, and embossed chrome SS logos.",
    isFeatured: true,
    isBestSeller: true,
    stock: 8,
    hasKnockingOption: true,
    batSpecs: {
      willowGrade: "Grade 1 English Willow",
      grainCount: 9,
      weightOz: 42.8, // ~ 2lb 10.8oz
      sweetSpot: "Mid-to-High",
      edgeThickness: "38mm",
      spineHeight: "64mm",
      handleType: "Round",
      sizesAvailable: ["Short Handle (SH)", "Harrow"],
    },
  },
  {
    id: "prod-3",
    name: "MRF Genius Grand Edition (Virat Kohli Signature)",
    slug: "mrf-genius-grand-edition-virat-kohli",
    sku: "MRF-GEN-VK18",
    brand: { name: "MRF", slug: "mrf", country: "India" },
    category: { name: "Cricket Bats", slug: "cricket-bats" },
    player: {
      name: "Virat Kohli",
      slug: "virat-kohli",
      country: "India",
      role: "Top-order Batter",
      avatarUrl: "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=400&q=80",
    },
    basePrice: 48000,
    discountPrice: 44500,
    rating: 5.0,
    reviewCount: 64,
    images: [
      "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=800&q=80",
    ],
    shortDescription: "The exact bat model used by King Kohli. Supreme balance and unrivaled ping off the face.",
    description: "Handcrafted from pristine Grade 1+ English Willow with laser-straight grain structure. Features Virat's signature shape with a heavy middle and duckbill toe profile.",
    isFeatured: true,
    isBestSeller: true,
    stock: 5,
    hasKnockingOption: true,
    batSpecs: {
      willowGrade: "Grade 1+ Limited Reserve Willow",
      grainCount: 12,
      weightOz: 43.8, // ~ 2lb 11.8oz
      sweetSpot: "Mid",
      edgeThickness: "41mm",
      spineHeight: "67mm",
      handleType: "Semi-Oval",
      sizesAvailable: ["Short Handle (SH)"],
    },
  },
  {
    id: "prod-4",
    name: "Gray-Nicolls Hypernova 1.3 5-Star English Willow",
    slug: "gray-nicolls-hypernova-13-5-star",
    sku: "GN-HYP-5ST",
    brand: { name: "Gray-Nicolls", slug: "gray-nicolls", country: "England" },
    category: { name: "Cricket Bats", slug: "cricket-bats" },
    player: {
      name: "Babar Azam",
      slug: "babar-azam",
      country: "Pakistan",
      role: "Top-order Batter",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    },
    basePrice: 38000,
    discountPrice: 33500,
    rating: 4.9,
    reviewCount: 29,
    images: [
      "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=800&q=80",
    ],
    shortDescription: "Iridescent blue decals and mid-to-low sweet spot engineered for wristy drives and pull shots.",
    description: "Gray-Nicolls Hypernova represents 160 years of master bat making. Featuring power-curve face and high-density composite toe protection.",
    isFeatured: false,
    isFlashSale: true,
    stock: 14,
    hasKnockingOption: true,
    batSpecs: {
      willowGrade: "Grade 1 English Willow",
      grainCount: 10,
      weightOz: 43.0,
      sweetSpot: "Mid",
      edgeThickness: "39mm",
      spineHeight: "65mm",
      handleType: "Oval",
      sizesAvailable: ["Short Handle (SH)", "Long Handle (LH)"],
    },
  },
  {
    id: "prod-5",
    name: "CA Plus 15000 7-Star Player Edition",
    slug: "ca-plus-15000-7-star",
    sku: "CA-PLS-15000",
    brand: { name: "CA Sports", slug: "ca", country: "Pakistan" },
    category: { name: "Cricket Bats", slug: "cricket-bats" },
    basePrice: 28000,
    discountPrice: 24500,
    rating: 4.7,
    reviewCount: 51,
    images: [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
    ],
    shortDescription: "Legendary subcontinent monster edge profile with glass-like ping off the face.",
    description: "CA Plus 15000 is famous worldwide for boundary-clearing rebound. Ready with factory toe-guard and 3D hologram authentication tag.",
    isFeatured: true,
    stock: 16,
    hasKnockingOption: true,
    batSpecs: {
      willowGrade: "Grade 1 Selected Willow",
      grainCount: 8,
      weightOz: 44.0,
      sweetSpot: "Low",
      edgeThickness: "42mm",
      spineHeight: "68mm",
      handleType: "Round",
      sizesAvailable: ["Short Handle (SH)"],
    },
  },
  {
    id: "prod-6",
    name: "Kookaburra Turf White Match Ball (Box of 6)",
    slug: "kookaburra-turf-white-box-of-6",
    sku: "KB-TRF-WHT-BX6",
    brand: { name: "Kookaburra", slug: "kookaburra", country: "Australia" },
    category: { name: "Cricket Balls", slug: "cricket-balls" },
    basePrice: 16500,
    discountPrice: 14800,
    rating: 5.0,
    reviewCount: 31,
    images: [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
    ],
    shortDescription: "Official ICC ODI & T20 international match ball. Four-piece alum tanned white leather.",
    description: "The premier white leather cricket ball used in international cricket worldwide. Unmatched seam longevity, shape retention, and swing characteristics.",
    isFeatured: false,
    isBestSeller: true,
    stock: 25,
  },
  {
    id: "prod-7",
    name: "Masuri E-Line Pro Titanium Cricket Helmet",
    slug: "masuri-e-line-pro-titanium-helmet",
    sku: "MAS-ELN-PRO-TI",
    brand: { name: "Gray-Nicolls", slug: "gray-nicolls", country: "England" },
    category: { name: "Batting Equipment", slug: "batting-equipment" },
    basePrice: 22000,
    discountPrice: 19500,
    rating: 4.9,
    reviewCount: 19,
    images: [
      "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=800&q=80",
    ],
    shortDescription: "Grade 1 titanium grille with patented Eye-Line protection and airlock ventilation.",
    description: "The gold standard in head protection worn by top test players. Built-in rear neck StemGuard attachment clip and ultra-lightweight titanium visor.",
    isFeatured: true,
    stock: 9,
  },
  {
    id: "prod-8",
    name: "SS Matrix Pro Batting Gloves (Split Finger)",
    slug: "ss-matrix-pro-batting-gloves",
    sku: "SS-MTX-GLV",
    brand: { name: "SS (Sareen Sports)", slug: "ss", country: "India" },
    category: { name: "Batting Equipment", slug: "batting-equipment" },
    basePrice: 6500,
    discountPrice: 5200,
    rating: 4.8,
    reviewCount: 45,
    images: [
      "https://images.unsplash.com/photo-1593766788306-2856e052d3e8?auto=format&fit=crop&w=800&q=80",
    ],
    shortDescription: "High-density foam with fiber inserts and ultra-soft sheep leather palm for maximum grip.",
    description: "Multi-flex split finger construction for effortless bat control. Sweat-absorbing wrist towelling band with dual sided touch fasteners.",
    isFlashSale: true,
    stock: 35,
  },
  {
    id: "prod-9",
    name: "New Balance CK10 v5 Cricket Spikes",
    slug: "new-balance-ck10-v5-spikes",
    sku: "NB-CK10-V5",
    brand: { name: "New Balance", slug: "new-balance", country: "USA / UK" },
    category: { name: "Cricket Shoes & Spikes", slug: "cricket-shoes" },
    basePrice: 14500,
    discountPrice: 12800,
    rating: 4.8,
    reviewCount: 27,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    ],
    shortDescription: "Elite all-rounder cricket spike with REVlite midsole cushioning and metal screw-in spikes.",
    description: "Lightweight lockdown engineered mesh upper, reinforced toe box for fast bowling impact, and 11-stud replaceable metal spike layout for turf pitches.",
    isFeatured: false,
    stock: 18,
  },
  {
    id: "prod-10",
    name: "Sidearm Pro Elite Ball Thrower (Speeds up to 140 km/h)",
    slug: "sidearm-pro-elite-thrower",
    sku: "SDM-PRO-ELT",
    brand: { name: "DSC (Delux Sports)", slug: "dsc", country: "India" },
    category: { name: "Training & Ground Gear", slug: "training-equipment" },
    basePrice: 4800,
    discountPrice: 3950,
    rating: 4.9,
    reviewCount: 68,
    images: [
      "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
    ],
    shortDescription: "Essential net practice tool used by international coaches to replicate 85-90mph bowling effortlessly.",
    description: "Flexible cup and composite shaft allow smooth, accurate delivery of real leather or practice balls with realistic pace and seam movement.",
    isBestSeller: true,
    stock: 40,
  },
];
