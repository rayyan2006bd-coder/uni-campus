export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'employer' | 'admin';
  campus: string;
  createdAt: string;
}

export interface AccommodationBooking {
  id?: string;
  userId: string;
  propertyName: string;
  propertyAddress: string;
  rent: number;
  coordinates: { lat: number; lng: number };
  visitDate: string;
  notes: string;
  createdAt: string;
}

export interface ColdStorageBooking {
  id?: string;
  userId: string;
  lockerNumber: string;
  storageType: 'refrigerated' | 'frozen';
  itemsStored: string;
  weightKg: number;
  expiresAt: string;
  createdAt: string;
  facilityId?: string;
  facilityName?: string;
  duration?: string;
  startDate?: string;
  priceTotal?: number;
  contact?: string;
  distance?: string;
}

export interface SafetyOrder {
  id?: string;
  userId: string;
  itemName: string;
  size: string;
  quantity: number;
  priceTotal: number;
  pickupStatus: 'pending' | 'ready' | 'picked_up';
  createdAt: string;
}

export interface Job {
  id?: string;
  title: string;
  company: string;
  department: string;
  location: string;
  salaryRange: string;
  description: string;
  postedBy: string;
  createdAt: string;
}

export interface JobApplication {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  jobId: string;
  jobTitle: string;
  company: string;
  coverLetter: string;
  status: 'applied' | 'reviewing' | 'interview' | 'offered' | 'rejected';
  createdAt: string;
}

export interface ShuttleBooking {
  id?: string;
  userId: string;
  routeName: string;
  stopFrom: string;
  stopTo: string;
  departureTime: string;
  qrCode: string;
  createdAt: string;
}

export interface MealEntry {
  mealName: string;
  proteinGrams: number;
  calories: number;
  loggedAt: string;
}

export interface MealSubscription {
  id?: string;
  userId: string;
  proteinGoal: number;
  mealsCount: number;
  meals: MealEntry[];
  updatedAt: string;
}

export interface MarketplaceItem {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'New' | 'Like New' | 'Very Good' | 'Good' | 'Fair';
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  isSold: boolean;
  createdAt: string;
  imageUrl?: string;
  negotiable?: boolean;
  exchangeRequested?: string;
  donationOption?: boolean;
  viewsCount?: number;
  savedBy?: string[];
  reported?: boolean;
}

export interface LaundryBooking {
  id?: string;
  userId: string;
  serviceType: string;
  weightLbs: number;
  pickupTime: string;
  notes: string;
  status: string;
  priceTotal: number;
  createdAt: string;
  colorSorting?: string;
  fabricSorting?: string;
  clothingType?: string;
  careInstructions?: string;
  deliveryTime?: string;
  packageSelection?: string;
}
