export interface Property {
  id: string;
  name: string;
  address: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  distanceToCampusSecs: number; // in minutes of walk/travel
  laundryIncluded: boolean;
  transitAccess: boolean;
  lat: number;
  lng: number;
  image: string;
}

export interface PresetJob {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  salaryRange: string;
  description: string;
}

export interface ShuttleRoute {
  id: string;
  routeName: string;
  stopFrom: string;
  stopTo: string;
  departureTime: string;
  frequencyMinutes: number;
  days: string;
  fromPinId: string;
  toPinId: string;
}

export interface ProteinMeal {
  id: string;
  name: string;
  proteinGrams: number;
  calories: number;
  price: number;
  description: string;
}

export const PRESET_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Aporajita Girls Hostel',
    address: 'Road 3, Kazla, Rajshahi (Adjacent to RUET Gate 2)',
    rent: 3200,
    bedrooms: 2,
    bathrooms: 2,
    distanceToCampusSecs: 3, // mins
    laundryIncluded: true,
    transitAccess: true,
    lat: 24.3635,
    lng: 88.6285,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prop-2',
    name: 'Shapla Female Paying Guest (PG)',
    address: 'Binodpur Bazaar Area, Rajshahi',
    rent: 4200,
    bedrooms: 1,
    bathrooms: 1,
    distanceToCampusSecs: 6,
    laundryIncluded: true,
    transitAccess: true,
    lat: 24.3642,
    lng: 88.6321,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prop-3',
    name: 'Talaimari Bachelor Shared Mess',
    address: 'Talaimari Crossing, Rajshahi',
    rent: 2800,
    bedrooms: 4,
    bathrooms: 2,
    distanceToCampusSecs: 10,
    laundryIncluded: false,
    transitAccess: true,
    lat: 24.3592,
    lng: 88.6215,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prop-4',
    name: 'Laxmipur Girls Secured PG',
    address: 'Medical College Road, Laxmipur, Rajshahi',
    rent: 5500,
    bedrooms: 1,
    bathrooms: 1,
    distanceToCampusSecs: 15,
    laundryIncluded: true,
    transitAccess: true,
    lat: 24.3725,
    lng: 88.5855,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prop-5',
    name: 'Shalbagan Student Suite (Bachelor flats)',
    address: 'Shalbagan Intersection, Rajshahi',
    rent: 6500,
    bedrooms: 2,
    bathrooms: 1,
    distanceToCampusSecs: 12,
    laundryIncluded: false,
    transitAccess: true,
    lat: 24.3812,
    lng: 88.6045,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prop-6',
    name: 'Upashahar Luxury Shared House',
    address: 'Sector 2, Upashahar, Rajshahi',
    rent: 12000,
    bedrooms: 3,
    bathrooms: 3,
    distanceToCampusSecs: 14,
    laundryIncluded: true,
    transitAccess: true,
    lat: 24.3785,
    lng: 88.6110,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80'
  }
];

export const PRESET_JOBS: PresetJob[] = [
  {
    id: 'job-1',
    title: 'Private Tutor (Physics/Math for HSC)',
    company: 'Rajshahi Academic Coaching Services',
    department: 'Science Division',
    location: 'Kazla (Near Campus Gate 1)',
    salaryRange: '৳6,000 - ৳8,000 / Month',
    description: 'Provide daily tutoring lessons to Higher Secondary Certificate (HSC) candidates in Physics, Mechanical Mathematics, and Calculus. Requires friendly communication and strong conceptual depth.'
  },
  {
    id: 'job-2',
    title: 'Lab Assistant (Part-time)',
    company: 'RUET Department of Electrical & Electronic Engineering',
    department: 'EEE Undergraduate Lab',
    location: 'EEE Wing, RUET Campus',
    salaryRange: '৳4,500 - ৳5,500 / Month',
    description: 'Assist in lab apparatus setups, manage basic breadboard and IC inventories, maintain laboratory logbooks, and assist faculty with routine student equipment logistics.'
  },
  {
    id: 'job-3',
    title: 'Part-time CAD Designer',
    company: 'Varendra Builders & Consultancy Ltd.',
    department: 'Structural Engineering',
    location: 'Shaheb Bazar Office (Flexible Hybrid)',
    salaryRange: '৳10,000 - ৳14,000 / Month',
    description: 'Draft structural layouts and mechanical component drawings using AutoCAD and SolidWorks. Flexible hours designed around standard RUET lecture slots.'
  },
  {
    id: 'job-4',
    title: 'Web Developer / Intern',
    company: 'Rajshahi Digital Tech Hub',
    department: 'Information Technology',
    location: 'Upashahar IT Block',
    salaryRange: '৳12,000 - ৳16,000 / Month',
    description: 'Support robust full-stack web applications using React, Tailwind CSS, and Firebase. Join a collaborative software development team with flexible working hours.'
  },
  {
    id: 'job-5',
    title: 'Graphic Designer',
    company: 'Creative Media Agency',
    department: 'Media & Communications',
    location: 'Laxmipur Crossing, Rajshahi',
    salaryRange: '৳5,000 - ৳7,000 / Month',
    description: 'Create engaging promotional designs, campus posters, and graphic vector banners for dynamic student campaigns.'
  },
  {
    id: 'job-6',
    title: 'Varendra Agri-Analytics Operator',
    company: 'Agri-Data Research Group',
    department: 'Data Compilation',
    location: 'Railgate Research Office',
    salaryRange: '৳4,000 - ৳5,200 / Month',
    description: 'Synthesize raw crop data into digital archives. Strong typing accuracy, basic database structures, and spreadsheet competency required.'
  },
  {
    id: 'job-7',
    title: 'Undergraduate Research Assistant',
    company: 'RUET Innovation & Incubation Lab',
    department: 'Computer Science Division',
    location: 'Research Block, RUET Campus',
    salaryRange: '৳8,000 - ৳10,500 / Month',
    description: 'Assist with literature analysis and basic Python simulations regarding machine learning on embedded microcontrollers.'
  },
  {
    id: 'job-8',
    title: 'Physics Content Writer',
    company: 'Shikhbe Shobai EdTech',
    department: 'Curriculum Planning',
    location: 'Talaimari Hub (Remote)',
    salaryRange: '৳4,500 - ৳6,000 / Month',
    description: 'Produce high-quality scientific explanations and practice problem solutions tailored to academic board criteria.'
  },
  {
    id: 'job-9',
    title: 'RUET Campus Student Ambassador',
    company: 'Stellar Academy Bangladesh',
    department: 'Outreach & Engagement',
    location: 'RUET Campus Base',
    salaryRange: '৳3,000 + Tech Benefits',
    description: 'Run workshops, orchestrate coding hackathons, represent tech learning pathways, and foster a beautiful student developer community.'
  }
];

export const PRESET_SHUTTLES: ShuttleRoute[] = [
  {
    id: 'shuttle-shaheb-bazar',
    routeName: 'Route Alpha — Shaheb Bazar Express',
    stopFrom: 'RUET Main gate',
    stopTo: 'Shaheb Bazar Zero Point',
    departureTime: '07:30 AM',
    frequencyMinutes: 30,
    days: 'Sun - Thu',
    fromPinId: 'ruet-main',
    toPinId: 'shaheb-bazar'
  },
  {
    id: 'shuttle-railgate',
    routeName: 'Route Beta — Railgate Direct Shuttle',
    stopFrom: 'RUET Kazla Gate',
    stopTo: 'Rajshahi Railgate Overpass',
    departureTime: '08:15 AM',
    frequencyMinutes: 20,
    days: 'Sun - Thu',
    fromPinId: 'ruet-kazla',
    toPinId: 'railgate'
  },
  {
    id: 'shuttle-laxmipur',
    routeName: 'Route Gamma — Laxmipur Loop Line',
    stopFrom: 'RUET Cafeteria Stop',
    stopTo: 'Laxmipur Medical Junction',
    departureTime: '09:00 AM',
    frequencyMinutes: 45,
    days: 'Sun - Thu',
    fromPinId: 'ruet-cafe',
    toPinId: 'laxmipur'
  },
  {
    id: 'shuttle-upashahar',
    routeName: 'Route Delta — Upashahar Residential',
    stopFrom: 'RUET Gate 2 (Aporajita Lane)',
    stopTo: 'Upashahar Central Park',
    departureTime: '08:45 AM',
    frequencyMinutes: 30,
    days: 'Daily',
    fromPinId: 'aporajita-lane',
    toPinId: 'upashahar'
  },
  {
    id: 'shuttle-binodpur',
    routeName: 'Route Epsilon — Binodpur Market Express',
    stopFrom: 'RUET Administration Block',
    stopTo: 'Binodpur New Bazaar stop',
    departureTime: '05:30 PM',
    frequencyMinutes: 15,
    days: 'Daily',
    fromPinId: 'ruet-admin',
    toPinId: 'binodpur'
  }
];

export const PRESET_PROTEIN_MEALS: ProteinMeal[] = [
  {
    id: 'meal-1',
    name: 'Chicken Rice Bowl',
    proteinGrams: 45,
    calories: 550,
    price: 180,
    description: 'Tender marinated chicken breast, steamed jasmine rice, rich lentils, and fresh green salad.'
  },
  {
    id: 'meal-2',
    name: 'High Protein Bengali Khichuri',
    proteinGrams: 38,
    calories: 620,
    price: 160,
    description: 'Premium red-lentil (Double Dal) aromatic khichuri served with double hard-boiled eggs and high-protein local pulses.'
  },
  {
    id: 'meal-3',
    name: 'Grilled Chicken Meal',
    proteinGrams: 50,
    calories: 480,
    price: 220,
    description: 'Juicy, flame-grilled skinless chicken breast served with steamed local vegetables and low-fat herbal gravy.'
  },
  {
    id: 'meal-4',
    name: 'Egg & Oats High Protein Combo',
    proteinGrams: 30,
    calories: 420,
    price: 120,
    description: 'Double boiled white egg whites, savory masala-cooked oats, raw sliced cucumbers and protein grains.'
  },
  {
    id: 'meal-5',
    name: 'Varendra Gym Protein Shake',
    proteinGrams: 32,
    calories: 280,
    price: 150,
    description: 'Blended whey isolate powder with Rajshahi sweet milk, raw local honey, and nutritious banana slices.'
  },
  {
    id: 'meal-6',
    name: 'Peanut Butter Honey Toast Duo',
    proteinGrams: 18,
    calories: 350,
    price: 80,
    description: 'Two slices of fresh whole wheat bread topped with premium unsalted peanut butter and honey drizzle.'
  },
  {
    id: 'meal-7',
    name: 'Student Fitness Package (Mighty Bowl)',
    proteinGrams: 65,
    calories: 800,
    price: 280,
    description: 'Ultimate bodybuilder meal packing shredded beef tenderloin, chicken chunks, chickpeas, and brown rice.'
  }
];

export interface RefrigerationFacility {
  id: string;
  name: string;
  capacity: string;
  tempRange: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  availableSlots: number;
  contact: string;
  distance: string;
  image: string;
}

export const REFRIGERATION_FACILITIES: RefrigerationFacility[] = [
  {
    id: 'fac-1',
    name: 'RUET Student Food Storage Center',
    capacity: '200 Kg',
    tempRange: '2°C to 8°C (Refrigerated) & -18°C (Frozen)',
    dailyRate: 15,
    weeklyRate: 80,
    monthlyRate: 300,
    availableSlots: 14,
    contact: '+880 1715-112233',
    distance: 'Inside RUET Central Cafeteria Area (0.1 km)',
    image: 'https://images.unsplash.com/photo-1571175432240-5f212265009f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'fac-2',
    name: 'Kazla Cold Storage Hub',
    capacity: '450 Kg',
    tempRange: '1°C to 10°C (Refrigerated) & -20°C (Frozen)',
    dailyRate: 20,
    weeklyRate: 100,
    monthlyRate: 350,
    availableSlots: 22,
    contact: '+880 1712-445566',
    distance: 'Near Kazla Gate 1 (0.3 km)',
    image: 'https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'fac-3',
    name: 'Campus Fresh Storage',
    capacity: '150 Kg',
    tempRange: '3°C to 7°C (Refrigerated Only)',
    dailyRate: 12,
    weeklyRate: 70,
    monthlyRate: 250,
    availableSlots: 8,
    contact: '+880 1713-778899',
    distance: 'Binodpur Gate Crossroads (0.4 km)',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'fac-4',
    name: 'Student Nutrition Storage Facility',
    capacity: '300 Kg',
    tempRange: '2°C to 6°C (Refrigerated) & -15°C (Frozen)',
    dailyRate: 18,
    weeklyRate: 90,
    monthlyRate: 320,
    availableSlots: 17,
    contact: '+880 1714-334455',
    distance: 'Aporajita Girls Hostel Road (0.2 km)',
    image: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'fac-5',
    name: 'SafeMed Refrigeration Point',
    capacity: '100 Kg',
    tempRange: '2°C to 5°C (Refrigerated - Pharmaceutical Grade)',
    dailyRate: 25,
    weeklyRate: 140,
    monthlyRate: 500,
    availableSlots: 5,
    contact: '+880 1716-667788',
    distance: 'Engineering Administration Block Medical Room (0.2 km)',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
  }
];

export interface MarketplaceCategory {
  name: string;
  items: string[];
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    name: 'Academic',
    items: ['Engineering Books', 'Lab Manuals', 'Class Notes', 'Drawing Instruments', 'Calculators']
  },
  {
    name: 'Electronics',
    items: ['Laptops', 'Monitors', 'Keyboards', 'Mouse', 'Headphones', 'Power Banks']
  },
  {
    name: 'Hostel & Room Essentials',
    items: ['Study Tables', 'Chairs', 'Fans', 'Lamps', 'Mattresses', 'Shelves']
  },
  {
    name: 'Transportation',
    items: ['Bicycles', 'Bicycle Accessories']
  },
  {
    name: 'Clothing',
    items: ['Hoodies', 'Jackets', 'Shoes', 'Bags']
  },
  {
    name: 'Fitness',
    items: ['Dumbbells', 'Resistance Bands', 'Protein Shakers']
  },
  {
    name: 'Entertainment',
    items: ['Speakers', 'Gaming Accessories']
  },
  {
    name: 'Community',
    items: ['Lost & Found', 'Free Items', 'Donation Corner', 'Exchange Items', 'Urgent Sale']
  }
];

export const DEMO_MARKETPLACE_ITEMS = [
  {
    title: 'FX-991ES Plus Scientific Calculator',
    description: 'Perfect for engineering physics, complex matrices, and structural equations. Like new condition.',
    price: 1100,
    category: 'Academic',
    condition: 'Like New' as const,
    imageUrl: 'https://images.unsplash.com/photo-1574607383476-f517f220d35b?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'Engineering Mechanics by Singer',
    description: 'Pristine textbook, highly relevant for ME and CE lines. No hand notes inside, clean pages.',
    price: 350,
    category: 'Academic',
    condition: 'Very Good' as const,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'Dell Se2219H 22 Inch IPS Monitor',
    description: '60Hz elegant display. Ideal for design work, programming labs, and split screen study terminals.',
    price: 8500,
    category: 'Electronics',
    condition: 'Very Good' as const,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'Phoenix Swift Student Bicycle',
    description: 'Dual v-brakes, durable steel carriage. Perfect for rushing from Kazla gate to CSE building.',
    price: 4800,
    category: 'Transportation',
    condition: 'Good' as const,
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'Folding Wood Study Table',
    description: 'Fits easily in compact double-seated mess rooms. Side groove for books and pen stand slots.',
    price: 1500,
    category: 'Hostel & Room Essentials',
    condition: 'Very Good' as const,
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'Mechanical drafting professional kit',
    description: 'Compass, drafting set divider, and precise structural ruler scale templates.',
    price: 800,
    category: 'Academic',
    condition: 'Like New' as const,
    imageUrl: 'https://images.unsplash.com/photo-1503387837-b154d5074bd2?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'Click Premium Hostel Fan',
    description: '3 adjustable speed logs, silent operation. Ensures cool nights under severe Rajshahi heat.',
    price: 1250,
    category: 'Hostel & Room Essentials',
    condition: 'Good' as const,
    imageUrl: 'https://images.unsplash.com/photo-1618944847058-841c3070a770?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'Aluminium Ergonomic Laptop Stand',
    description: 'Improves posture while programming inside heat-stifled hostel desks. Sturdy grips.',
    price: 450,
    category: 'Electronics',
    condition: 'New' as const,
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'EEE Solid State Devices Lab Kit',
    description: 'Complete breadboard, resistors, LEDs, operational amplifiers, capacitors and bread jumpers package.',
    price: 1400,
    category: 'Academic',
    condition: 'Very Good' as const,
    imageUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'Programming Algorithms Bundle',
    description: 'Introduction to Algorithms (CLRS) paired with clean C++ and Python interview prep volumes.',
    price: 1200,
    category: 'Academic',
    condition: 'Like New' as const,
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80'
  }
];
