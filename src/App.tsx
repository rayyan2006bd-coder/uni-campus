import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

// Core imports
import { auth, db } from './lib/firebase';
import {
  UserProfile,
  AccommodationBooking,
  ColdStorageBooking,
  SafetyOrder,
  JobApplication,
  ShuttleBooking,
  MealSubscription,
  MarketplaceItem,
  LaundryBooking
} from './types';
import {
  PRESET_PROPERTIES,
  PRESET_JOBS,
  PRESET_SHUTTLES,
  PRESET_PROTEIN_MEALS,
  REFRIGERATION_FACILITIES,
  MARKETPLACE_CATEGORIES,
  DEMO_MARKETPLACE_ITEMS,
  Property,
  PresetJob,
  ShuttleRoute,
  ProteinMeal
} from './data';
import CampusMap from './components/CampusMap';
import StudentAnalytics from './components/StudentAnalytics';
import GeminiAppAssistant from './components/GeminiAppAssistant';

// Lucide icon imports
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Bus,
  Dumbbell,
  ShoppingBag,
  WashingMachine,
  User,
  Lock,
  Plus,
  Search,
  LogOut,
  Clock,
  ArrowRight,
  ChevronRight,
  Calendar,
  Flame,
  Utensils,
  Check,
  Trash2,
  QrCode,
  AlertCircle,
  Database,
  RefreshCw,
  FileText,
  Layers,
  Info,
  Shirt,
  FolderOpen,
  Star,
  Eye,
  TrendingUp,
  Compass,
  HelpCircle,
  Heart,
  Filter,
  Share2
} from 'lucide-react';

const getFriendlyAuthErrorMessage = (err: any): string => {
  if (!err) return '';
  const message = err.message || '';
  const code = err.code || '';
  
  if (code === 'auth/operation-not-allowed' || message.includes('operation-not-allowed')) {
    return 'The Email/Password provider is currently not enabled in this Firebase project. To enable it: 1) Go to your Firebase Console under Authentication > Sign-in method; 2) Enable "Email/Password"; 3) Click Save. Alternatively, please use the "Sign In with Google" button below, which works immediately.';
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Incorrect credentials. Please verify your email or password, or register a new profile.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'This email address is already registered. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password should be at least 6 characters.';
  }
  return message || 'Authentication sequence failed.';
};

export default function App() {
  // Authentication state logic
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authCampus, setAuthCampus] = useState('Rajshahi University of Engineering & Technology (RUET)');
  const [activeUniversities, setActiveUniversities] = useState<string[]>([
    'Rajshahi University of Engineering & Technology (RUET)'
  ]);
  const [authRole, setAuthRole] = useState<'student' | 'employer' | 'admin'>('student');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // General App global variables
  const [isAdminExpansionOpen, setIsAdminExpansionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'accommodation' | 'storage' | 'safety' | 'career' | 'transit' | 'protein' | 'marketplace' | 'laundry'>('overview');
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline'>('online');
  const [currentLocalTime, setCurrentLocalTime] = useState(new Date().toLocaleTimeString());

  // Dynamic user document states synchronizations from Firestore
  const [accommodationBookings, setAccommodationBookings] = useState<AccommodationBooking[]>([]);
  const [coldStorageBookings, setColdStorageBookings] = useState<ColdStorageBooking[]>([]);
  const [safetyOrders, setSafetyOrders] = useState<SafetyOrder[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [shuttleBookings, setShuttleBookings] = useState<ShuttleBooking[]>([]);
  const [mealSubscription, setMealSubscription] = useState<MealSubscription | null>(null);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [laundryBookings, setLaundryBookings] = useState<LaundryBooking[]>([]);

  // Selected details or wizard state bindings
  // Accommodation Tab variables:
  const [selectedPropId, setSelectedPropId] = useState<string>('prop-1');
  const [inspectDate, setInspectDate] = useState<string>('');
  const [inspectNotes, setInspectNotes] = useState<string>('');
  
  // Cold storage state variables:
  const [selectedStorageFacilityId, setSelectedStorageFacilityId] = useState<string>('fac-1');
  const [storageCategory, setStorageCategory] = useState<string>('Mini Fridge Shelf Rental');
  const [lockerItemsInput, setLockerItemsInput] = useState<string>('');
  const [lockerWeightKg, setLockerWeightKg] = useState<number>(2);
  const [storageTypeOption, setStorageTypeOption] = useState<'refrigerated' | 'frozen'>('refrigerated');
  const [expiresAtDate, setExpiresAtDate] = useState<string>('');
  const [storageDuration, setStorageDuration] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [storageStartDate, setStorageStartDate] = useState<string>('');

  // Safety store orders state vars:
  const [selectedSafetyGear, setSelectedSafetyGear] = useState<string>('Lab goggles ($12.50)');
  const [safetyGearQty, setSafetyGearQty] = useState<number>(1);
  const [safetySize, setSafetySize] = useState<string>('M');

  // Careers state:
  const [selectedJob, setSelectedJob] = useState<PresetJob>(PRESET_JOBS[0]);
  const [coverLetterInput, setCoverLetterInput] = useState<string>('');

  // Transit state:
  const [transitRouteId, setTransitRouteId] = useState<string>('route-north-to-scitech');
  const [departureDateOption, setDepartureDateOption] = useState<string>('');

  // Protein Tracker:
  const [proteinGoalGoal, setProteinGoalGoal] = useState<number>(120);
  const [customMealName, setCustomMealName] = useState<string>('');
  const [customMealProtein, setCustomMealProtein] = useState<number>(25);
  const [customMealCalories, setCustomMealCalories] = useState<number>(450);

  // Marketplace states:
  const [marketTitle, setMarketTitle] = useState<string>('');
  const [marketPrice, setMarketPrice] = useState<number>(150);
  const [marketCategory, setMarketCategory] = useState<string>('Academic');
  const [marketCondition, setMarketCondition] = useState<'New' | 'Like New' | 'Very Good' | 'Good' | 'Fair'>('Very Good');
  const [marketDesc, setMarketDesc] = useState<string>('');
  const [marketImageUrl, setMarketImageUrl] = useState<string>('');
  const [marketNegotiable, setMarketNegotiable] = useState<boolean>(true);
  const [marketExchangeRequested, setMarketExchangeRequested] = useState<string>('');
  const [marketDonationOption, setMarketDonationOption] = useState<boolean>(false);
  const [marketplaceSearch, setMarketplaceSearch] = useState<string>('');
  const [marketplaceFilterCategory, setMarketplaceFilterCategory] = useState<string>('All');

  // Laundry states:
  const [laundryTypeSelection, setLaundryTypeSelection] = useState<string>('Wash & Dry');
  const [laundryLbs, setLaundryLbs] = useState<number>(5);
  const [laundryPickupTime, setLaundryPickupTime] = useState<string>('');
  const [laundryDeliveryTime, setLaundryDeliveryTime] = useState<string>('');
  const [laundryNotesInput, setLaundryNotesInput] = useState<string>('');
  const [laundryColorSorting, setLaundryColorSorting] = useState<string>('Light Colors');
  const [laundryFabricSorting, setLaundryFabricSorting] = useState<string>('Cotton');
  const [laundryClothingType, setLaundryClothingType] = useState<string>('Shirts');
  const [laundryCareInstructions, setLaundryCareInstructions] = useState<string>('Normal Wash');
  const [laundrySelectedPackage, setLaundrySelectedPackage] = useState<string>('Weekly Laundry Plan');

  // Map coordination pins binding context:
  const [focusedPinId, setFocusedPinId] = useState<string>('');
  const [alertNotes, setAlertNotes] = useState<{ id: string; text: string; urgent: boolean }[]>([
    { id: '1', text: 'Safety Depot order is ready for pickup during office hours.', urgent: false },
    { id: '2', text: 'Cold locker spaces are filling up in SciTech building.', urgent: true }
  ]);

  // UseEffect hook to clock refresh rate
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLocalTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to Auth stage
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Load Custom Firestore profile details
        try {
          const profileDoc = await getDoc(doc(db, 'users', user.uid));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile);
          } else {
            // Setup default user profile on the fly
            const initialProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || user.email?.split('@')[0] || 'Student Member',
              role: 'student',
              campus: 'Rajshahi University of Engineering & Technology (RUET)',
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', user.uid), initialProfile);
            setUserProfile(initialProfile);
          }
          // Fetch dynamic records
          fetchStudentData(user.uid);
        } catch (err) {
          console.error("Critical Profile Error: ", err);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        clearStudentLocalStates();
      }
    });

    return () => unsubscribe();
  }, []);

  const clearStudentLocalStates = () => {
    setAccommodationBookings([]);
    setColdStorageBookings([]);
    setSafetyOrders([]);
    setJobApplications([]);
    setShuttleBookings([]);
    setMealSubscription(null);
    setMarketplaceItems([]);
    setLaundryBookings([]);
  };

  // Sync / Download data collections list from Cloud Firestore
  const fetchStudentData = async (uid: string) => {
    if (!uid) return;
    try {
      setSyncStatus('online');

      // 1. Accommodation
      const accomQuery = query(collection(db, 'accommodationBookings'), where('userId', '==', uid));
      const accomDocs = await getDocs(accomQuery);
      const accList: AccommodationBooking[] = [];
      accomDocs.forEach(d => accList.push({ id: d.id, ...d.data() } as AccommodationBooking));
      setAccommodationBookings(accList);

      // 2. Cold Storage
      const storageQuery = query(collection(db, 'coldStorageBookings'), where('userId', '==', uid));
      const storageDocs = await getDocs(storageQuery);
      const stList: ColdStorageBooking[] = [];
      storageDocs.forEach(d => stList.push({ id: d.id, ...d.data() } as ColdStorageBooking));
      setColdStorageBookings(stList);

      // 3. Safety Orders
      const safetyQuery = query(collection(db, 'safetyOrders'), where('userId', '==', uid));
      const safetyDocs = await getDocs(safetyQuery);
      const sfList: SafetyOrder[] = [];
      safetyDocs.forEach(d => sfList.push({ id: d.id, ...d.data() } as SafetyOrder));
      setSafetyOrders(sfList);

      // 4. Job Applications
      const jobsQuery = query(collection(db, 'jobApplications'), where('userId', '==', uid));
      const jobDocs = await getDocs(jobsQuery);
      const jbList: JobApplication[] = [];
      jobDocs.forEach(d => jbList.push({ id: d.id, ...d.data() } as JobApplication));
      setJobApplications(jbList);

      // 5. Shuttle Bookings
      const transitQuery = query(collection(db, 'shuttleBookings'), where('userId', '==', uid));
      const transitDocs = await getDocs(transitQuery);
      const trList: ShuttleBooking[] = [];
      transitDocs.forEach(d => trList.push({ id: d.id, ...d.data() } as ShuttleBooking));
      setShuttleBookings(trList);

      // 6. Meal nutrition records
      const mealQuery = query(collection(db, 'mealSubscriptions'), where('userId', '==', uid));
      const mealDocs = await getDocs(mealQuery);
      if (!mealDocs.empty) {
        const firstDoc = mealDocs.docs[0];
        setMealSubscription({ id: firstDoc.id, ...firstDoc.data() } as MealSubscription);
      } else {
        // Create base meal record
        const initialSub: MealSubscription = {
          userId: uid,
          proteinGoal: 120,
          mealsCount: 0,
          meals: [],
          updatedAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'mealSubscriptions'), initialSub);
        setMealSubscription({ id: docRef.id, ...initialSub });
      }

      // 7. Student Marketplace items
      // Load all items available since it's a peer system (or custom listings)
      const marketQuery = collection(db, 'marketplaceItems');
      const marketDocs = await getDocs(marketQuery);
      const marketList: MarketplaceItem[] = [];
      marketDocs.forEach(d => marketList.push({ id: d.id, ...d.data() } as MarketplaceItem));
      setMarketplaceItems(marketList);

      // 8. Laundry orders
      const laundryQuery = query(collection(db, 'laundryBookings'), where('userId', '==', uid));
      const laundryDocs = await getDocs(laundryQuery);
      const ldList: LaundryBooking[] = [];
      laundryDocs.forEach(d => ldList.push({ id: d.id, ...d.data() } as LaundryBooking));
      setLaundryBookings(ldList);

    } catch (err) {
      console.error("Firestore sync error:", err);
      setSyncStatus('offline');
    }
  };

  // Auth execution actions:
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (!authEmail || !authPassword) {
      setAuthError('Email and password must not be empty.');
      setAuthLoading(false);
      return;
    }

    try {
      if (authMode === 'register') {
        if (!authName.trim()) {
          setAuthError('Please enter your full academic name.');
          setAuthLoading(false);
          return;
        }
        // Register standard Firebase credential
        const res = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        const profile: UserProfile = {
          uid: res.user.uid,
          email: authEmail,
          name: authName,
          role: authRole,
          campus: authCampus,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', res.user.uid), profile);
        setUserProfile(profile);
      } else {
        // Login credential logic
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(getFriendlyAuthErrorMessage(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminDemoSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    const email = "admin@campus.edu";
    const password = "campusadmin123";
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      // If user doesn't exist or wrong credential, build on the fly
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password'
      ) {
        try {
          const res = await createUserWithEmailAndPassword(auth, email, password);
          const profile: UserProfile = {
            uid: res.user.uid,
            email: email,
            name: "Admin Administrator",
            role: "admin",
            campus: "Rajshahi University of Engineering & Technology (RUET)",
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', res.user.uid), profile);
          setUserProfile(profile);
        } catch (regErr: any) {
          if (regErr.code === 'auth/email-already-in-use') {
            await signInWithEmailAndPassword(auth, email, password);
          } else {
            throw regErr;
          }
        }
      } else {
        setAuthError(getFriendlyAuthErrorMessage(err));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleStudentDemoSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    const email = "student@campus.edu";
    const password = "studentcampus123";
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password'
      ) {
        try {
          const res = await createUserWithEmailAndPassword(auth, email, password);
          const profile: UserProfile = {
            uid: res.user.uid,
            email: email,
            name: "Richard Hendricks",
            role: "student",
            campus: "Rajshahi University of Engineering & Technology (RUET)",
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', res.user.uid), profile);
          setUserProfile(profile);
        } catch (regErr: any) {
          if (regErr.code === 'auth/email-already-in-use') {
            await signInWithEmailAndPassword(auth, email, password);
          } else {
            throw regErr;
          }
        }
      } else {
        setAuthError(getFriendlyAuthErrorMessage(err));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setAuthError(getFriendlyAuthErrorMessage(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  // MODULE ACTION IMPLEMENTATIONS:

  // 1. Accommodation Visit log reservation
  const saveVisitBooking = async () => {
    if (!currentUser) return;
    const propDetails = PRESET_PROPERTIES.find(p => p.id === selectedPropId);
    if (!propDetails || !inspectDate) {
      alert("Please select a properties tour matching card, and define inspect date.");
      return;
    }

    try {
      const payload: AccommodationBooking = {
        userId: currentUser.uid,
        propertyName: propDetails.name,
        propertyAddress: propDetails.address,
        rent: propDetails.rent,
        coordinates: { lat: propDetails.lat, lng: propDetails.lng },
        visitDate: inspectDate,
        notes: inspectNotes || 'Tour of the campus properties.',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'accommodationBookings'), payload);
      setInspectDate('');
      setInspectNotes('');
      fetchStudentData(currentUser.uid);
      setFocusedPinId(propDetails.id === 'prop-1' ? 'dorm-north' : 'dorm-south');
      alert(`Property inspection scheduled for ${propDetails.name}!`);
    } catch (err) {
      console.error("Save tour error:", err);
    }
  };

  const deleteAccommodationTour = async (id: string) => {
    if (!id || !currentUser) return;
    try {
      await deleteDoc(doc(db, 'accommodationBookings', id));
      fetchStudentData(currentUser.uid);
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Cold Storage Reservation log
  const saveColdStorage = async () => {
    if (!currentUser) return;
    if (!lockerItemsInput.trim()) {
      alert("Please catalog the items description before booking space.");
      return;
    }

    const facility = REFRIGERATION_FACILITIES.find(f => f.id === selectedStorageFacilityId) || REFRIGERATION_FACILITIES[0];

    // Weight limit verification
    const activeLockerTotalWeight = coldStorageBookings
      .filter(b => b.facilityId === selectedStorageFacilityId || b.lockerNumber === facility.name)
      .reduce((acc, curr) => acc + curr.weightKg, 0);

    if (activeLockerTotalWeight + lockerWeightKg > 450) {
      alert(`Locker space overload alert! This facility already has ${activeLockerTotalWeight}kg stored. Max capacity is ${facility.capacity}.`);
      return;
    }

    let rate = facility.dailyRate;
    let daysMultiplier = 1;
    if (storageDuration === 'weekly') {
      rate = facility.weeklyRate;
      daysMultiplier = 7;
    } else if (storageDuration === 'monthly') {
      rate = facility.monthlyRate;
      daysMultiplier = 30;
    }

    const calculatedPrice = rate * lockerWeightKg;
    const computedExp = storageStartDate
      ? new Date(new Date(storageStartDate).getTime() + daysMultiplier * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date(Date.now() + daysMultiplier * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const payload: ColdStorageBooking = {
        userId: currentUser.uid,
        lockerNumber: facility.name,
        storageType: storageTypeOption,
        itemsStored: `${storageCategory}: ${lockerItemsInput}`,
        weightKg: Number(lockerWeightKg),
        expiresAt: computedExp,
        createdAt: new Date().toISOString(),
        facilityId: selectedStorageFacilityId,
        facilityName: facility.name,
        duration: storageDuration,
        startDate: storageStartDate || new Date().toISOString().split('T')[0],
        priceTotal: calculatedPrice,
        contact: facility.contact,
        distance: facility.distance
      };

      await addDoc(collection(db, 'coldStorageBookings'), payload);
      setLockerItemsInput('');
      setLockerWeightKg(2);
      setStorageStartDate('');
      fetchStudentData(currentUser.uid);
      setFocusedPinId('cold-storage');
      alert(`Successfully registered a cold refrigeration space slot at ${facility.name} for ৳${calculatedPrice}!`);
    } catch (err) {
      console.error("Locker saving error:", err);
    }
  };

  const deleteColdStorage = async (id: string) => {
    if (!id || !currentUser) return;
    try {
      await deleteDoc(doc(db, 'coldStorageBookings', id));
      fetchStudentData(currentUser.uid);
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Safety Store equipment transaction checkout
  const checkoutSafetyOrder = async () => {
    if (!currentUser) return;

    let price = 350;
    let itemName = "LED Safe Corridor Torch & Keychain Siren";
    if (selectedSafetyGear.includes("Button") || selectedSafetyGear.includes("Panic")) {
      price = 450;
      itemName = "Portable Personal Safety Panic Button";
    } else if (selectedSafetyGear.includes("Pepper") || selectedSafetyGear.includes("Spray")) {
      price = 250;
      itemName = "Pepper Spray Key Ring";
    } else if (selectedSafetyGear.includes("Apron") || selectedSafetyGear.includes("Combo")) {
      price = 600;
      itemName = "Female Lab Apron & Safety Goggles Combo";
    } else if (selectedSafetyGear.includes("Reflective") || selectedSafetyGear.includes("Vest") || selectedSafetyGear.includes("vest")) {
      price = 400;
      itemName = "Reflective Night Safety Vest";
    }

    try {
      const payload: SafetyOrder = {
        userId: currentUser.uid,
        itemName,
        size: safetySize,
        quantity: safetyGearQty,
        priceTotal: Number((price * safetyGearQty).toFixed(0)),
        pickupStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'safetyOrders'), payload);
      fetchStudentData(currentUser.uid);
      setFocusedPinId('safety-store');
      alert(`Safety Order placed successfully! Collect at the campus safety depot using your user profile ID.`);
    } catch (err) {
      console.error("Safety order failed: ", err);
    }
  };

  const updateSafetyPickup = async (orderId: string, status: 'ready' | 'picked_up') => {
    if (!currentUser || !orderId) return;
    try {
      await updateDoc(doc(db, 'safetyOrders', orderId), { pickupStatus: status });
      fetchStudentData(currentUser.uid);
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Careers job application submission
  const submitCareerApplication = async () => {
    if (!currentUser) return;
    if (!coverLetterInput.trim()) {
      alert("Please type a quick statement supporting your application.");
      return;
    }

    try {
      const payload: JobApplication = {
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        userName: userProfile?.name || 'Student Candidate',
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        coverLetter: coverLetterInput,
        status: 'applied',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'jobApplications'), payload);
      setCoverLetterInput('');
      fetchStudentData(currentUser.uid);
      setFocusedPinId('career-office');
      alert(`Your job application for the ${selectedJob.title} post is submitted!`);
    } catch (err) {
      console.error("Application error: ", err);
    }
  };

  // 5. Shuttle Transit Ticket dynamic generation
  const submitTransitBooking = async () => {
    if (!currentUser) return;
    const shuttle = PRESET_SHUTTLES.find(s => s.id === transitRouteId);
    if (!shuttle) return;

    try {
      const payload: ShuttleBooking = {
        userId: currentUser.uid,
        routeName: shuttle.routeName,
        stopFrom: shuttle.stopFrom,
        stopTo: shuttle.stopTo,
        departureTime: departureDateOption || shuttle.departureTime,
        qrCode: 'SHUTTLE-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'shuttleBookings'), payload);
      setDepartureDateOption('');
      fetchStudentData(currentUser.uid);
      setFocusedPinId(shuttle.fromPinId);
      alert(`Dynamic Transit QR Ticket generated for ${shuttle.routeName}! Show your screen at terminal gates.`);
    } catch (err) {
      console.error("Shuttle error:", err);
    }
  };

  const deleteShuttleTicket = async (id: string) => {
    if (!id || !currentUser) return;
    try {
      await deleteDoc(doc(db, 'shuttleBookings', id));
      fetchStudentData(currentUser.uid);
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Protein Diet / Nutrition meals tracking updater
  const addProteinTrackingMeal = async (selectedPresetMeal?: ProteinMeal) => {
    if (!currentUser || !mealSubscription) return;

    let mealName = customMealName;
    let protein = customMealProtein;
    let calories = customMealCalories;

    if (selectedPresetMeal) {
      mealName = selectedPresetMeal.name;
      protein = selectedPresetMeal.proteinGrams;
      calories = selectedPresetMeal.calories;
    }

    if (!mealName.trim()) {
      alert("Please provide the protein meal description.");
      return;
    }

    const newMeal = {
      mealName,
      proteinGrams: Number(protein),
      calories: Number(calories),
      loggedAt: new Date().toLocaleDateString()
    };

    const updatedMeals = [...(mealSubscription.meals || []), newMeal];

    try {
      await updateDoc(doc(db, 'mealSubscriptions', mealSubscription.id!), {
        meals: updatedMeals,
        mealsCount: updatedMeals.length,
        proteinGoal: proteinGoalGoal,
        updatedAt: new Date().toISOString()
      });

      setCustomMealName('');
      fetchStudentData(currentUser.uid);
      setFocusedPinId('protein-center');
      alert(`Logged: "${mealName}" successfully!`);
    } catch (err) {
      console.error("Meal logging error: ", err);
    }
  };

  const updateGoalSetting = async () => {
    if (!currentUser || !mealSubscription) return;
    try {
      await updateDoc(doc(db, 'mealSubscriptions', mealSubscription.id!), {
        proteinGoal: Number(proteinGoalGoal),
        updatedAt: new Date().toISOString()
      });
      fetchStudentData(currentUser.uid);
      alert("Protein target updated.");
    } catch (err) {
      console.error(err);
    }
  };

  const resetAllMeals = async () => {
    if (!currentUser || !mealSubscription) return;
    try {
      await updateDoc(doc(db, 'mealSubscriptions', mealSubscription.id!), {
        meals: [],
        mealsCount: 0,
        updatedAt: new Date().toISOString()
      });
      fetchStudentData(currentUser.uid);
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Marketplace Trade operations
  const publishMarketItem = async () => {
    if (!currentUser) return;
    if (!marketTitle.trim() || !marketPrice) {
      alert("Provide item title and price values.");
      return;
    }

    try {
      const payload: MarketplaceItem = {
        title: marketTitle,
        description: marketDesc || 'Authentic student peer supply.',
        price: Number(marketPrice),
        category: marketCategory,
        condition: marketCondition,
        sellerId: currentUser.uid,
        sellerName: userProfile?.name || 'Student Resident',
        sellerEmail: currentUser.email || '',
        isSold: false,
        createdAt: new Date().toISOString(),
        imageUrl: marketImageUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        negotiable: marketNegotiable,
        exchangeRequested: marketExchangeRequested,
        donationOption: marketDonationOption,
        viewsCount: 1,
        savedBy: [],
        reported: false
      };

      await addDoc(collection(db, 'marketplaceItems'), payload);
      setMarketTitle('');
      setMarketPrice(150);
      setMarketDesc('');
      setMarketImageUrl('');
      setMarketNegotiable(true);
      setMarketExchangeRequested('');
      setMarketDonationOption(false);
      fetchStudentData(currentUser.uid);
      alert("Successfully published C2C trade item on the student board!");
    } catch (err) {
      console.error("Market error:", err);
    }
  };

  const buyOrMarkSoldMarketItem = async (itemId: string, markSold: boolean) => {
    if (!currentUser || !itemId) return;
    try {
      await updateDoc(doc(db, 'marketplaceItems', itemId), { isSold: markSold });
      fetchStudentData(currentUser.uid);
      alert(markSold ? "Item successfully marked as sold! Checkouts closed for this listing." : "Order request placed and item purchased successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const negotiatePriceMarketItem = async (itemId: string, proposedPrice: number) => {
    if (!currentUser || !itemId) return;
    try {
      await updateDoc(doc(db, 'marketplaceItems', itemId), { price: proposedPrice });
      fetchStudentData(currentUser.uid);
      alert(`Negotiation offer sent to seller! Price set/updated to ৳${proposedPrice}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const exchangeRequestMarketItem = async (itemId: string, exchangeItems: string) => {
    if (!currentUser || !itemId) return;
    try {
      await updateDoc(doc(db, 'marketplaceItems', itemId), { exchangeRequested: exchangeItems });
      fetchStudentData(currentUser.uid);
      alert(`Exchange request sent to seller: "${exchangeItems}"`);
    } catch (err) {
      console.error(err);
    }
  };

  const reportMarketItem = async (itemId: string) => {
    if (!currentUser || !itemId) return;
    try {
      await updateDoc(doc(db, 'marketplaceItems', itemId), { reported: true });
      fetchStudentData(currentUser.uid);
      alert("This listing has been reported to RUET Academic Student Hub administrators. It will be reviewed within 24 hours.");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSaveMarketItem = async (itemId: string, isCurrentlySaved: boolean) => {
    if (!currentUser || !itemId) return;
    try {
      const item = marketplaceItems.find(i => i.id === itemId);
      let newSavedBy = item?.savedBy || [];
      if (isCurrentlySaved) {
        newSavedBy = newSavedBy.filter(uid => uid !== currentUser.uid);
      } else {
        newSavedBy = [...newSavedBy, currentUser.uid];
      }
      await updateDoc(doc(db, 'marketplaceItems', itemId), { savedBy: newSavedBy });
      fetchStudentData(currentUser.uid);
      alert(isCurrentlySaved ? "Item removed from favorites." : "Item added to favorites!");
    } catch (err) {
      console.error(err);
    }
  };

  const trackViewsMarketItem = async (itemId: string) => {
    if (!currentUser || !itemId) return;
    try {
      const item = marketplaceItems.find(i => i.id === itemId);
      const currentViews = item?.viewsCount || 0;
      await updateDoc(doc(db, 'marketplaceItems', itemId), { viewsCount: currentViews + 1 });
      setMarketplaceItems(prev => prev.map(p => p.id === itemId ? { ...p, viewsCount: currentViews + 1 } : p));
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Laundry orders reservation setup
  const submitLaundryServiceOrder = async () => {
    if (!currentUser) return;
    if (!laundryPickupTime) {
      alert("Must define pick time.");
      return;
    }

    // Laundry rates (BDT)
    let priceTotal = 0;
    if (laundryTypeSelection === 'Wash Only') {
      priceTotal = Number((laundryLbs * 15).toFixed(0));
    } else if (laundryTypeSelection === 'Wash & Dry') {
      priceTotal = Number((laundryLbs * 25).toFixed(0));
    } else if (laundryTypeSelection === 'Wash, Dry & Fold') {
      priceTotal = Number((laundryLbs * 35).toFixed(0));
    } else if (laundryTypeSelection === 'Wash, Dry & Iron') {
      priceTotal = Number((laundryLbs * 45).toFixed(0));
    } else if (laundryTypeSelection === 'Ironing Only') {
      priceTotal = Number((laundryLbs * 10).toFixed(0));
    } else if (laundryTypeSelection === 'Dry Cleaning') {
      priceTotal = Number((laundryLbs * 80).toFixed(0));
    } else if (laundryTypeSelection === 'Express Laundry') {
      priceTotal = Number((laundryLbs * 55).toFixed(0));
    } else if (laundryTypeSelection === 'Same-Day Laundry') {
      priceTotal = Number((laundryLbs * 70).toFixed(0));
    } else if (laundryTypeSelection === 'Hostel Basic Package') {
      priceTotal = 400;
    } else if (laundryTypeSelection === 'Hostel Premium Package') {
      priceTotal = 750;
    } else if (laundryTypeSelection === 'Weekly Laundry Plan') {
      priceTotal = 250;
    } else if (laundryTypeSelection === 'Monthly Laundry Subscription') {
      priceTotal = 1200;
    } else {
      priceTotal = Number((laundryLbs * 25).toFixed(0));
    }

    try {
      const payload: LaundryBooking = {
        userId: currentUser.uid,
        serviceType: laundryTypeSelection,
        weightLbs: Number(laundryLbs),
        pickupTime: laundryPickupTime,
        notes: laundryNotesInput || 'Please handle university uniforms with maximum care.',
        status: 'Pickup Scheduled',
        priceTotal,
        createdAt: new Date().toISOString(),
        colorSorting: laundryColorSorting,
        fabricSorting: laundryFabricSorting,
        clothingType: laundryClothingType,
        careInstructions: laundryCareInstructions,
        deliveryTime: laundryDeliveryTime || new Date(new Date(laundryPickupTime).getTime() + 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16),
        packageSelection: laundryTypeSelection.includes('Package') || laundryTypeSelection.includes('Plan') || laundryTypeSelection.includes('Subscription') ? laundryTypeSelection : 'None'
      };

      await addDoc(collection(db, 'laundryBookings'), payload);
      setLaundryPickupTime('');
      setLaundryDeliveryTime('');
      setLaundryNotesInput('');
      fetchStudentData(currentUser.uid);
      alert(`Laundry reservation confirmed! Total price estimate: ৳${priceTotal}. Standard tracker updates on checkout.`);
    } catch (err) {
      console.error("Laundry error:", err);
    }
  };

  const updateLaundryStatusInApp = async (bookingId: string, status: string) => {
    if (!currentUser || !bookingId) return;
    try {
      await updateDoc(doc(db, 'laundryBookings', bookingId), { status });
      fetchStudentData(currentUser.uid);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // RENDER INTERFACES:
  // -------------------------------------------------------------

  // Custom visual indicator step bar generator for current laundry task
  const renderLaundrySteps = (currentStatus: string) => {
    const statuses = ['Pickup Scheduled', 'Picked Up', 'Washing', 'Ironing', 'Out for Delivery', 'Delivered'];
    const activeIndex = statuses.indexOf(currentStatus);

    return (
      <div className="flex items-center justify-between gap-1 w-full mt-3 bg-neutral-50 p-2.5 rounded-lg border border-neutral-150 overflow-x-auto">
        {statuses.map((step, idx) => {
          const isCompleted = idx <= activeIndex && activeIndex !== -1;
          const isCurrent = idx === activeIndex;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center flex-1 min-w-[70px] text-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isCurrent ? 'bg-black text-white ring-3 ring-neutral-200' :
                  isCompleted ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-550'
                }`}>
                  {isCompleted && !isCurrent ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <span className={`text-[8px] font-semibold mt-1 font-mono uppercase tracking-wider leading-tight ${
                  isCurrent ? 'text-neutral-900 font-bold' : isCompleted ? 'text-neutral-700' : 'text-neutral-400'
                }`}>
                  {step}
                </span>
              </div>
              {idx < statuses.length - 1 && (
                <div className={`flex-1 h-0.5 min-w-[15px] ${idx < activeIndex ? 'bg-neutral-800' : 'bg-neutral-250'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // AUTH PRE-SCREEN ROUTER:
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        {/* Ambient background blur circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.035] pointer-events-none"></div>

        <div id="auth-card" className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/80 p-8 space-y-6 shadow-2xl relative z-10 animate-[fadeIn_0.3s_ease-out]">
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-650 text-white shadow-lg shadow-blue-950/40 mb-1">
              <ShieldCheck className="w-6 h-6 animate-float" />
            </div>
            <h1 className="font-display font-extrabold text-2xl tracking-tight text-white select-none">
              uni <span className="text-blue-400">campus</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Authenticate with your administrative or academic credentials to access secure university logistics.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/50 rounded-xl text-[11px] leading-relaxed select-none space-y-1.5 text-slate-310">
            <div className="flex gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-slate-300">
                <p className="font-bold text-amber-400 uppercase tracking-wider text-[9px] font-mono">Firebase Console Connection Note</p>
                <p className="mt-1 text-slate-400">
                  The default setup restricts Email sign-ups until <strong>Email/Password</strong> provider is enabled in Firebase.
                </p>
                <p className="mt-1 text-neutral-900 font-bold bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded-sm inline-block">
                  Google Sign-In is fully active and supported out of the box!
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Full Academic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Richard Hendricks"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full text-xs text-white placeholder-slate-500 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2.5 outline-none transition-all"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono block">University Email</label>
              <input
                type="email"
                required
                placeholder="you@campus.edu"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full text-xs text-white placeholder-slate-500 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2.5 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Security Password</label>
              <input
                type="password"
                required
                placeholder="6+ characters complex"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full text-xs text-white placeholder-slate-500 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2.5 outline-none transition-all"
              />
            </div>

            {authMode === 'register' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Campus Node</label>
                  <select
                    value={authCampus}
                    onChange={(e) => setAuthCampus(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 outline-none text-white cursor-pointer"
                  >
                    {activeUniversities.map(uni => (
                      <option key={uni} value={uni}>{uni.replace(' School', '').replace(' University', '')}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono block">System Role</label>
                  <select
                    value={authRole}
                    onChange={(e) => setAuthRole(e.target.value as any)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 outline-none text-white cursor-pointer"
                  >
                    <option value="student">Student Member</option>
                    <option value="employer">Campus Recruiter</option>
                    <option value="admin">College Administrator</option>
                  </select>
                </div>
              </div>
            )}

            {authError && (
              <div className="p-3 border border-rose-900/50 bg-rose-950/40 text-rose-300 text-xs rounded-xl font-mono leading-relaxed">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full text-xs font-bold uppercase tracking-widest bg-blue-650 hover:bg-blue-600 disabled:bg-slate-800 text-white py-3.5 rounded-xl transition-all shadow-md shadow-blue-900/20 cursor-pointer text-center"
            >
              {authLoading ? 'Authorizing in Cloud...' : authMode === 'login' ? 'Sign In' : 'Create Academic Profile'}
            </button>
          </form>

          {/* Alternative Google Connection */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800/80"></div>
              </div>
              <span className="relative bg-[#111827] px-3 text-[9px] uppercase tracking-widest font-bold text-slate-500 font-mono">Or connect via</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full text-xs font-bold uppercase hover:border-slate-600 tracking-widest bg-slate-950 border border-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{authLoading ? 'Connecting...' : 'Sign In with Google'}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/30 text-center space-y-4">
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition-colors outline-none block mx-auto cursor-pointer"
            >
              {authMode === 'login' ? "Register Profile" : "Back to Login"}
            </button>

            <div className="pt-4 border-t border-slate-800/65 flex flex-col gap-2">
              <span className="text-[9px] uppercase tracking-widest font-bold text-slate-550 font-mono block text-center">Fast-Track Demo Credentials</span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAdminDemoSignIn}
                  disabled={authLoading}
                  className="text-[9px] font-bold uppercase tracking-wider bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-650 text-white py-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Admin Sign In
                </button>
                <button
                  type="button"
                  onClick={handleStudentDemoSignIn}
                  disabled={authLoading}
                  className="text-[9px] font-bold uppercase tracking-wider bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-650 text-white py-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Student Sign In
                </button>
              </div>

              <div className="mt-2 bg-slate-950 border border-slate-800/60 p-3 rounded-xl text-[9px] font-mono text-left text-slate-400 space-y-1.5 select-all">
                <p className="font-bold text-slate-350 border-b border-slate-800/80 pb-1">Pre-registered accounts (Require Email Auth enabled):</p>
                <p>• Student: <span className="text-white select-all font-bold">student@campus.edu</span> / <span className="text-white font-bold">studentcampus123</span></p>
                <p>• Admin: <span className="text-white select-all font-bold">admin@campus.edu</span> / <span className="text-white font-bold">campusadmin123</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate dynamic counts and values for AI context summaries
  const totalLockerAllocationWeight = coldStorageBookings.reduce((acc, c) => acc + c.weightKg, 0);
  const currentMealsSummary = `${mealSubscription?.mealsCount || 0} meals entered. Target protein is ${mealSubscription?.proteinGoal || 120}g`;

  return (
    <div className="flex h-screen w-full bg-[#FAFBFD] text-[#1E293B] font-sans overflow-hidden">
      <aside className="w-72 bg-[#0B0F19] flex flex-col justify-between py-6 px-5 border-r border-[#1E293B]/60 shrink-0 select-none overflow-y-auto">
        <div>
          {/* Brand Logo with dynamic glowing marker */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-650 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-950/50">
              <Sparkles className="w-4 h-4 text-white animate-float" />
            </div>
            <div>
              <span className="text-white font-display font-extrabold tracking-tight text-base block">uni campus</span>
              <span className="text-[10px] text-blue-400 font-mono tracking-wider">RUET PRESETS PHASE 1</span>
            </div>
          </div>
          
          <nav className="space-y-6">
            <div className="text-[#64748B] text-[9px] uppercase tracking-widest font-bold mb-3 px-2">Campus Modules</div>
            <ul className="space-y-1">
              {[
                { id: 'overview', label: 'Dashboard Overview', icon: Layers },
                { id: 'accommodation', label: 'Accommodations', icon: MapPin },
                { id: 'storage', label: 'Cold Lockers', icon: Lock },
                { id: 'safety', label: 'Lab Safety Store', icon: ShieldCheck },
                { id: 'career', label: 'Career Board', icon: Briefcase },
                { id: 'transit', label: 'QR Shuttle Transit', icon: Bus },
                { id: 'protein', label: 'Dietary Protein Logs', icon: Dumbbell },
                { id: 'marketplace', label: 'Student Trade C2C', icon: ShoppingBag },
                { id: 'laundry', label: 'Laundry Sorter', icon: WashingMachine },
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-3 text-xs tracking-wide transition-all cursor-pointer border-0 outline-none text-left w-full px-3.5 py-3 rounded-xl font-sans ${
                        isSelected 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-md shadow-blue-950/80 scale-[1.02]' 
                          : 'text-[#94A3B8] hover:text-white hover:bg-slate-900/50'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        
        <div className="pt-5 border-t border-slate-800 mt-6 shrink-0 space-y-3.5">
          <div className="flex items-center justify-between gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm uppercase shrink-0 shadow-sm shadow-blue-550/20">
                {userProfile?.name?.charAt(0) || <User className="w-4 h-4 text-slate-300" />}
              </div>
              <div className="min-w-0">
                <div className="text-white text-xs font-bold truncate leading-tight">{userProfile?.name}</div>
                <div className="text-slate-400 text-[10px] truncate mt-0.5">{currentUser.email}</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-slate-850 text-slate-400 hover:text-rose-400 transition-all rounded-lg border border-transparent shrink-0 cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[#475569] text-[8px] font-mono tracking-wider uppercase font-extrabold text-center block leading-relaxed max-w-[200px] mx-auto border-t border-slate-800/10 pt-1.5 shrink-0">
            {userProfile?.campus || 'Rajshahi University of Engineering & Technology (RUET)'}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-100 bg-white px-8 flex items-center justify-between shrink-0 shadow-3xs z-10">
          <div>
            <h1 className="text-lg font-display font-extrabold text-[#1E293B] tracking-tight flex items-center gap-1.5">
              <span>
                {activeTab === 'overview' ? 'Daily Overview' : 
                 activeTab === 'accommodation' ? 'Accommodations Comparison' :
                 activeTab === 'storage' ? 'Cold Storage Lab Lockers' :
                 activeTab === 'safety' ? 'Lab Safety Store' :
                 activeTab === 'career' ? 'Campus Career Board' :
                 activeTab === 'transit' ? 'Shuttle Transit Passes' :
                 activeTab === 'protein' ? 'Dietary Protein tracking' :
                 activeTab === 'marketplace' ? 'Student Peer Trade board' :
                 'Laundry Services Milestone'}
              </span>
              <span className="text-slate-300 font-normal"> / </span>
              <span className="text-slate-400 font-sans font-medium text-xs"> {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#FAFBFD] px-3 py-1.5 border border-slate-100 rounded-xl shadow-3xs">
              <div className={`w-2 h-2 rounded-full ${syncStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`}></div>
              <span className="text-[9px] font-mono font-bold text-[#475569] uppercase tracking-wider">
                {syncStatus === 'online' ? 'Cloud Sync Live' : 'Offline Mode'}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#FAFBFD] px-3 py-1.5 border border-slate-100 rounded-xl shadow-3xs font-mono text-[9px] font-bold text-[#475569]">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{currentLocalTime} / UTC</span>
            </div>
          </div>
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#FAFBFD] no-scrollbar">
          
          {/* QUICK DOCK ALERT TICKER */}
          {alertNotes.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl flex items-center justify-between gap-4 shadow-md shrink-0 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-blue-500 text-white px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-3xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LIVE UPDATE
                </span>
                <p className="text-xs text-slate-300 font-medium font-sans">
                  {alertNotes[0].text} Need help? Type on the Campus AI Coprocessor guide slot.
                </p>
              </div>
              <button
                onClick={() => setAlertNotes(prev => prev.slice(1))}
                className="text-slate-400 hover:text-white font-mono text-[9px] uppercase tracking-wider font-bold bg-slate-800/60 hover:bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-700/50 transition-all cursor-pointer shrink-0"
              >
                Dismiss Notice
              </button>
            </div>
          )}

          {/* -------------------------------------------------------------------------- */}
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {/* -------------------------------------------------------------------------- */}
          {activeTab === 'overview' && (
          <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
            
            {/* Visual intro greetings */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Welcome back, {userProfile?.name}</h2>
                <p className="text-xs text-neutral-500 mt-1">Here is a centralized rundown of your digital housing, lockers, nutri-progress logs, and safety actions.</p>
              </div>
              <div className="text-xs bg-white text-neutral-700 font-semibold border border-neutral-200 px-4 py-2 rounded-lg flex items-center gap-2">
                <Database className="w-4 h-4 text-neutral-900" />
                <span>Standard schema: 8 active database entities in cloud storage</span>
              </div>
            </div>

            {/* Recharts Visual Panels */}
            <StudentAnalytics
              proteinGoal={mealSubscription?.proteinGoal || 120}
              mealsData={mealSubscription?.meals?.map(m => ({ date: m.loggedAt, protein: m.proteinGrams, calories: m.calories })) || []}
              storageCapacity={10}
              storageUsed={totalLockerAllocationWeight}
              completedLaundryCount={laundryBookings.length}
              totalMarketplaceSales={marketplaceItems.filter(i => i.sellerId === currentUser.uid && i.isSold).reduce((acc, c) => acc + c.price, 0)}
            />

            {/* FUTURE UNIVERSITY EXPANSION SETTINGS PANEL */}
            <div className="p-6 bg-gradient-to-r from-neutral-900 to-stone-850 text-white rounded-xl shadow-xs space-y-4 border border-stone-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-sm bg-amber-500 text-neutral-950 font-mono font-bold text-[9px] uppercase tracking-wider">Phase 1 Launch: RUET Primed</span>
                    <h3 className="font-sans font-bold text-[14px]">Multi-University Scale & Administrative Configuration</h3>
                  </div>
                  <p className="text-stone-400 text-xs leading-relaxed max-w-2xl">
                    By default, the platform experience, interactive vector map, and local BDT pricing are configured for <strong>Rajshahi University of Engineering & Technology (RUET)</strong>. Toggling settings below updates the registration system to let peers from nearby institutions onboard.
                  </p>
                </div>
                
                <button
                  onClick={() => setIsAdminExpansionOpen(!isAdminExpansionOpen)}
                  className="px-4 py-2 bg-stone-750 hover:bg-stone-700 border border-stone-600 rounded-lg text-xs font-bold font-mono transition-colors text-white shrink-0"
                >
                  {isAdminExpansionOpen ? 'Minimize Control Panel ↗' : 'Configure Expansion ⚙'}
                </button>
              </div>

              {isAdminExpansionOpen && (
                <div className="pt-4 border-t border-stone-850 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-2 p-4 bg-stone-900/50 rounded-lg border border-stone-800">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-stone-200">Rajshahi University (RU)</span>
                      <input
                        type="checkbox"
                        checked={activeUniversities.includes('Rajshahi University (RU)')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveUniversities([...activeUniversities, 'Rajshahi University (RU)']);
                          } else {
                            setActiveUniversities(activeUniversities.filter(u => u !== 'Rajshahi University (RU)'));
                          }
                        }}
                        className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-stone-800 h-4 w-4 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                      Enable shared female mess and paying guest accommodations for RU academic students near Motihar, Rajshahi.
                    </p>
                  </div>

                  <div className="space-y-2 p-4 bg-stone-900/50 rounded-lg border border-stone-800">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-stone-200">Rajshahi Medical College (RMC)</span>
                      <input
                        type="checkbox"
                        checked={activeUniversities.includes('Rajshahi Medical College (RMC)')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveUniversities([...activeUniversities, 'Rajshahi Medical College (RMC)']);
                          } else {
                            setActiveUniversities(activeUniversities.filter(u => u !== 'Rajshahi Medical College (RMC)'));
                          }
                        }}
                        className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-stone-800 h-4 w-4 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                      Enable specialized hostel setups and clinical rotation logistics around Laxmipur Hospital Road.
                    </p>
                  </div>

                  <div className="space-y-2 p-4 bg-stone-900/50 rounded-lg border border-stone-800">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-stone-200">Other Bangladesh Universities</span>
                      <input
                        type="checkbox"
                        checked={activeUniversities.includes('Other Bangladesh Universities')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveUniversities([...activeUniversities, 'Other Bangladesh Universities']);
                          } else {
                            setActiveUniversities(activeUniversities.filter(u => u !== 'Other Bangladesh Universities'));
                          }
                        }}
                        className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-stone-800 h-4 w-4 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                      Open universal sign-ups for visiting engineering students from BUET, KUET, CUET, and others in the region.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Campus Map + Gemini AI Assistant Side-Side section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-sans font-bold text-neutral-900 text-sm uppercase tracking-wider text-neutral-500">Interactive Location Map</h3>
                  <span className="text-[10px] text-neutral-400 font-mono">100% vector projected</span>
                </div>
                <CampusMap selectedPinId={focusedPinId || 'dorm-north'} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-sans font-bold text-neutral-900 text-sm uppercase tracking-wider text-neutral-500">Academic AI Coprocessor</h3>
                  <span className="text-[10px] text-neutral-400 font-mono">Generative Summaries</span>
                </div>
                <GeminiAppAssistant
                  studentProfile={userProfile}
                  contextData={{
                    bookingsCount: accommodationBookings.length,
                    lockersCount: coldStorageBookings.length,
                    jobApplications: jobApplications.length,
                    proteinQuotas: currentMealsSummary
                  }}
                />
              </div>
            </div>

            {/* HIGH FIDELITY FEATURED CAMPUS SECTIONS BENTO GRID */}
            <div className="space-y-4 pt-4 border-t border-neutral-150">
              <div className="flex justify-between items-center">
                <h3 className="font-sans font-bold text-neutral-900 text-sm uppercase tracking-wider text-neutral-500">RUET Live Campus Catalogues</h3>
                <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase">Kazla Gate Regional Node</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Featured Marketplace Deals */}
                <div className="bg-white p-5 rounded-xl border border-neutral-100 shadow-3xs hover:border-neutral-200 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2 mb-3">
                      <h4 className="font-sans font-extrabold text-neutral-900 text-xs flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-neutral-750" />
                        Featured Trade Deals
                      </h4>
                      <span className="text-[9px] font-mono bg-[#EBF5FF] text-[#0066CC] font-bold px-1.5 py-0.5 rounded-sm">C2C board</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2.5 items-center bg-neutral-50 p-2 rounded-lg border border-neutral-150/50">
                        <img 
                          src="https://images.unsplash.com/photo-1574607383476-f517f220d35b?auto=format&fit=crop&w=150&q=80" 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-md border border-neutral-200 shrink-0" 
                        />
                        <div className="truncate text-xs">
                          <p className="font-bold text-neutral-900 truncate">FX-991ES Plus Scientific</p>
                          <p className="text-[10px] text-neutral-500 font-mono">৳1,100 BDT • Like New</p>
                        </div>
                      </div>

                      <div className="flex gap-2.5 items-center bg-neutral-50 p-2 rounded-lg border border-neutral-150/50">
                        <img 
                          src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80" 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-md border border-neutral-200 shrink-0" 
                        />
                        <div className="truncate text-xs">
                          <p className="font-bold text-neutral-900 truncate">Engineering Mechanics</p>
                          <p className="text-[10px] text-neutral-500 font-mono">৳350 BDT • Very Good</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="w-full mt-4 py-2 bg-neutral-905 hover:bg-neutral-950 text-white hover:text-white rounded-lg text-[10px] font-bold font-sans transition-colors block text-center"
                  >
                    View All Trade Deals →
                  </button>
                </div>

                {/* 2. Available Laundry Packages */}
                <div className="bg-white p-5 rounded-xl border border-neutral-100 shadow-3xs hover:border-neutral-200 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2 mb-3">
                      <h4 className="font-sans font-extrabold text-neutral-900 text-xs flex items-center gap-1.5">
                        <Shirt className="w-3.5 h-3.5 text-neutral-750" />
                        Hostel Laundry Plans
                      </h4>
                      <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-sm">24h turn</span>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-150/50 flex justify-between items-center">
                        <div className="text-xs">
                          <p className="font-bold text-neutral-900">Hostel Basic Pack</p>
                          <p className="text-[10px] text-neutral-500">10 Kg wash, dry & fold</p>
                        </div>
                        <span className="font-mono font-bold text-neutral-900 text-xs">৳400/mo</span>
                      </div>

                      <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-150/50 flex justify-between items-center">
                        <div className="text-xs">
                          <p className="font-bold text-neutral-900">Hostel Premium Pack</p>
                          <p className="text-[10px] text-neutral-500">25 Kg wash, iron + steam</p>
                        </div>
                        <span className="font-mono font-bold text-neutral-900 text-xs">৳750/mo</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('laundry')}
                    className="w-full mt-4 py-2 bg-neutral-905 hover:bg-neutral-950 text-white hover:text-white rounded-lg text-[10px] font-bold font-sans transition-colors block text-center"
                  >
                    Schedule Pickup Laundry →
                  </button>
                </div>

                {/* 3. Nearby Cold storage Lockers */}
                <div className="bg-white p-5 rounded-xl border border-neutral-100 shadow-3xs hover:border-neutral-200 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2 mb-3">
                      <h4 className="font-sans font-extrabold text-neutral-900 text-xs flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5 text-neutral-750" />
                        Student Cold Storage
                      </h4>
                      <span className="text-[9px] font-mono bg-pink-50 text-pink-700 font-bold px-1.5 py-0.5 rounded-sm">Insulated</span>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-150/50 flex justify-between items-center">
                        <div className="text-xs truncate max-w-[130px]">
                          <p className="font-bold text-neutral-900 truncate">RUET Student Fridge</p>
                          <p className="text-[10px] text-neutral-500 truncate">Kazla (0.4 km from campus)</p>
                        </div>
                        <span className="font-mono font-bold text-neutral-900 text-xs">৳15/day</span>
                      </div>

                      <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-150/50 flex justify-between items-center">
                        <div className="text-xs truncate max-w-[130px]">
                          <p className="font-bold text-neutral-900 truncate">Kazla Cold Food Hub</p>
                          <p className="text-[10px] text-neutral-500 truncate">Kazla Gate (0.5 km)</p>
                        </div>
                        <span className="font-mono font-bold text-neutral-900 text-xs">৳18/day</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('storage')}
                    className="w-full mt-4 py-2 bg-neutral-905 hover:bg-neutral-950 text-white hover:text-white rounded-lg text-[10px] font-bold font-sans transition-colors block text-center"
                  >
                    Reserve Locker Slot →
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 2: ACCOMMODATION COMPARISON MATRIX */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'accommodation' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">Accommodation Listings & Side-by-Side Comparison</h2>
                <p className="text-xs text-slate-500 mt-1">Review student apartment packages and schedule inspection visits securely using Firestore.</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-600 font-bold border border-blue-100 px-3.5 py-1.5 rounded-xl shadow-3xs">
                ✓ Verified Campus Partners
              </span>
            </div>

            {/* Interactive Properties Side-by-Side Comparison Grid table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-slate-700 uppercase tracking-wider">Side-By-Side Parameters Matrix</span>
                <span className="text-[11px] text-slate-500 font-medium">Comparing {PRESET_PROPERTIES.length} Premium Listings</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[10px] bg-slate-50/50">
                      <th className="px-6 py-4 font-semibold">Property</th>
                      <th className="px-6 py-4 font-semibold">Monthly Rent</th>
                      <th className="px-6 py-4 font-semibold">Layout Plan</th>
                      <th className="px-6 py-4 font-semibold">Transit Access</th>
                      <th className="px-6 py-4 font-semibold">Laundry Included</th>
                      <th className="px-6 py-4 font-semibold">Distance To Hub</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRESET_PROPERTIES.map(p => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">{p.name}</td>
                        <td className="px-6 py-4 font-mono font-extrabold text-blue-600 text-sm">৳{p.rent}/mo</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{p.bedrooms} Beds / {p.bathrooms} Bath</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${p.transitAccess ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-150 text-slate-500'}`}>
                            {p.transitAccess ? 'Direct stops' : 'Walk'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-600 font-medium">{p.laundryIncluded ? 'Yes, free' : 'Dorm laundromat'}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500">{p.distanceToCampusSecs} min away</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Schedule Visit block & active tour lists side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Properties Form Scheduler */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-3xs space-y-4">
                <h3 className="font-display font-extrabold text-slate-900 text-sm">Schedule On-Foot Inspection Tour</h3>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Select Property</label>
                    <select
                      value={selectedPropId}
                      onChange={(e) => setSelectedPropId(e.target.value)}
                      className="w-full text-xs bg-slate-50/80 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl p-3 outline-none transition-all cursor-pointer"
                    >
                      {PRESET_PROPERTIES.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - ৳{p.rent}/mo</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Tour Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={inspectDate}
                      onChange={(e) => setInspectDate(e.target.value)}
                      className="w-full text-xs bg-slate-50/80 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl p-3 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Inspection Notes / Questions</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Inquiring about roommate policies..."
                      value={inspectNotes}
                      onChange={(e) => setInspectNotes(e.target.value)}
                      className="w-full text-xs bg-slate-50/80 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl p-3 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={saveVisitBooking}
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-[#0B0F19] hover:bg-[#1E293B] text-white rounded-xl transition-all cursor-pointer shadow-sm shadow-[#0B0F19]/25 text-center"
                >
                  Schedule Tour visit
                </button>
              </div>

              {/* Saved property visits lists */}
              <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-3xs space-y-4">
                <h3 className="font-display font-extrabold text-slate-900 text-sm">My Active Tour Inspections ({accommodationBookings.length})</h3>

                {accommodationBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">No active property inspection tours scheduled. Fill the form to set a live showing.</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[300px] no-scrollbar">
                    {accommodationBookings.map(b => (
                      <div key={b.id} className="p-4 border border-slate-100 hover:border-slate-200 rounded-xl hover:bg-slate-50/30 flex justify-between items-center gap-3 transition-all">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900">{b.propertyName}</h4>
                          <p className="text-[11px] text-slate-500">{b.propertyAddress}</p>
                          <div className="flex gap-2 items-center text-[10px] font-mono mt-2 text-slate-400">
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold">Rent: ৳{b.rent}</span>
                            <span>| Scheduled: {new Date(b.visitDate).toLocaleString()}</span>
                          </div>
                          {b.notes && <p className="text-[11px] italic text-slate-400 bg-slate-50 p-2 rounded-lg mt-2">"{b.notes}"</p>}
                        </div>
                        <button
                          onClick={() => deleteAccommodationTour(b.id!)}
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 3: SMART COLD STORAGE BOOKINGS */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'storage' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">Student Cold Storage & Refrigeration</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Secure, temperature-monitored cold storage solutions for RUET students' raw food, protein shakes, supplementary diets, and medical compounds.
                </p>
              </div>
              <span className="text-xs font-bold font-mono bg-[#E0F2FE] text-[#0369A1] px-3.5 py-1.5 rounded-xl border border-sky-100 shadow-3xs">
                RUET Cold-Chain Network
              </span>
            </div>

            {/* List of nearby refrigeration facilities */}
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-[#1E293B] text-sm">Select Nearby Refrigeration Facility</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {REFRIGERATION_FACILITIES.map(fac => {
                  const isSelected = fac.id === selectedStorageFacilityId;
                  return (
                    <div
                      key={fac.id}
                      className={`p-4 bg-white border rounded-2xl flex flex-col justify-between transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-md shadow-blue-500/5'
                          : 'border-slate-100 hover:border-slate-350 hover:shadow-xs'
                      }`}
                      onClick={() => setSelectedStorageFacilityId(fac.id)}
                    >
                      <div className="space-y-2.5">
                        <div className="relative">
                          <img
                            referrerPolicy="no-referrer"
                            src={fac.image}
                            alt={fac.name}
                            className="w-full h-24 object-cover rounded-xl"
                          />
                          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-3xs text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md">
                            {fac.distance}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-sans font-bold text-xs text-slate-900 leading-tight truncate-2-lines h-8">{fac.name}</h4>
                        </div>
                        
                        <div className="space-y-1.5 text-[10px] font-mono text-slate-600 border-t border-slate-100 pt-2.5">
                          <div className="flex justify-between">
                            <span>Capacity:</span>
                            <span className="font-bold text-slate-800">{fac.capacity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Temp Mode:</span>
                            <span className="font-bold text-blue-600 truncate max-w-[90px]" title={fac.tempRange}>
                              {fac.tempRange.split('(')[0]}
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-slate-500 mt-1">
                            <span>Daily:</span>
                            <span className="font-bold text-slate-800">৳{fac.dailyRate}/Kg</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Weekly:</span>
                            <span className="font-bold text-slate-800">৳{fac.weeklyRate}/Kg</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Monthly:</span>
                            <span className="font-bold text-slate-800">৳{fac.monthlyRate}/Kg</span>
                          </div>
                          
                          <div className="flex justify-between text-emerald-600 font-bold mt-1 bg-emerald-50/50 p-1 rounded-md">
                            <span>Available:</span>
                            <span>{fac.availableSlots} units</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`w-full mt-3 py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-[#1E293B]'
                        }`}
                      >
                        {isSelected ? 'Selected ✓' : 'Use Facility'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Locker Booking Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-3xs space-y-4">
                <h3 className="font-display font-extrabold text-[#1E293B] text-sm">Space Reservation Portal</h3>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Service category</label>
                    <select
                      value={storageCategory}
                      onChange={(e) => setStorageCategory(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl p-3 outline-none transition-all cursor-pointer"
                    >
                      <option value="Mini Fridge Shelf Rental">Mini Fridge Shelf Rental</option>
                      <option value="Freezer Compartment Rental">Freezer Compartment Rental</option>
                      <option value="Monthly Food Storage">Monthly Food Storage</option>
                      <option value="Vacation Storage">Vacation Storage</option>
                      <option value="Protein Supplement Storage">Protein Supplement Storage</option>
                      <option value="Medicine Refrigeration">Medicine Refrigeration</option>
                      <option value="Frozen Food Storage">Frozen Food Storage</option>
                      <option value="Shared Student Fridge Space">Shared Student Fridge Space</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Temp mode type</label>
                      <div className="flex gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <button
                          type="button"
                          onClick={() => setStorageTypeOption('refrigerated')}
                          className={`flex-1 text-[11px] py-1 text-center font-bold rounded-lg transition-all cursor-pointer ${
                            storageTypeOption === 'refrigerated' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Refrig
                        </button>
                        <button
                          type="button"
                          onClick={() => setStorageTypeOption('frozen')}
                          className={`flex-1 text-[11px] py-1 text-center font-bold rounded-lg transition-all cursor-pointer ${
                            storageTypeOption === 'frozen' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Frozen
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Weight scale (Kg)</label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={lockerWeightKg}
                        onChange={(e) => setLockerWeightKg(Math.max(1, Number(e.target.value)))}
                        className="w-full text-xs bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-xl p-3 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Billing Duration</label>
                      <select
                        value={storageDuration}
                        onChange={(e) => setStorageDuration(e.target.value as any)}
                        className="w-full text-xs bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-xl p-3 outline-none cursor-pointer transition-all"
                      >
                        <option value="daily">Daily Rates</option>
                        <option value="weekly">Weekly Rates</option>
                        <option value="monthly">Monthly Rates</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Start date</label>
                      <input
                        type="date"
                        required
                        value={storageStartDate}
                        onChange={(e) => setStorageStartDate(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-xl p-3 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Specific Items Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cooked beef box, insulin tubes, whey jar"
                      value={lockerItemsInput}
                      onChange={(e) => setLockerItemsInput(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-xl p-3 outline-none"
                    />
                  </div>

                  {/* Payment Summary Box */}
                  {(() => {
                    const activeFac = REFRIGERATION_FACILITIES.find(f => f.id === selectedStorageFacilityId) || REFRIGERATION_FACILITIES[0];
                    let chosenRate = activeFac.dailyRate;
                    if (storageDuration === 'weekly') chosenRate = activeFac.weeklyRate;
                    if (storageDuration === 'monthly') chosenRate = activeFac.monthlyRate;
                    const calculatedTotalPr = chosenRate * lockerWeightKg;

                    return (
                      <div className="bg-[#FAFBFD] p-3.5 rounded-xl border border-slate-100 space-y-1.5 shadow-3xs">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Charge Summary Breakdown</div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Facility:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[150px]">{activeFac.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Tier:</span>
                          <span className="font-semibold text-sky-800 text-[10px] bg-sky-50 px-2 py-0.5 rounded-md">{storageCategory}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Multipliers:</span>
                          <span className="font-mono text-slate-800 font-medium">{lockerWeightKg} Kg • ৳{chosenRate}/{storageDuration}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2.5 mt-2">
                          <span className="font-bold text-slate-900">Calculated Fees:</span>
                          <span className="font-mono font-extrabold text-blue-600 text-sm">৳{calculatedTotalPr} BDT</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <button
                  onClick={saveColdStorage}
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-[#0B0F19] hover:bg-[#1E293B] text-white rounded-xl transition-all cursor-pointer shadow-sm shadow-[#0B0F19]/25 text-center mt-2"
                >
                  Confirm Space Reservation
                </button>
              </div>

              {/* Dynamic Locker Occupancies summaries */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                
                {/* Visual indicator of Locker allocation */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-3xs space-y-4">
                  <h3 className="font-display font-extrabold text-[#1E293B] text-sm">Active Room & Cold Storage Reserves ({coldStorageBookings.length})</h3>

                  {coldStorageBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                        <Lock className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">No active cold-chain locker bookings registered in Firestore database.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[350px] overflow-y-auto font-sans no-scrollbar">
                      {coldStorageBookings.map(b => {
                        return (
                          <div key={b.id} className="p-4 border border-slate-100 hover:border-slate-200 rounded-xl hover:bg-slate-50/30 flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all animate-[fadeIn_0.15s_ease-out]">
                            <div className="space-y-1.5">
                              <div className="flex gap-2 items-center flex-wrap">
                                <span className="font-sans font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{b.lockerNumber}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-mono font-bold border ${
                                  b.storageType === 'frozen' 
                                    ? 'bg-sky-50 text-sky-600 border-sky-150' 
                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                  {b.storageType}
                                </span>
                                {b.distance && (
                                  <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{b.distance}</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 font-semibold bg-[#FAFBFD] p-2 rounded-lg border border-slate-50/80">Stored: "{b.itemsStored}"</p>
                              
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400 mt-2">
                                <span>Weight: <strong className="text-slate-700 font-bold">{b.weightKg} Kg</strong></span>
                                <span>Duration: <strong className="text-slate-700 font-bold">{b.duration || 'Daily'}</strong></span>
                                {b.priceTotal && (
                                  <span>Total: <strong className="text-emerald-600 font-extrabold">৳{b.priceTotal}</strong></span>
                                )}
                                <span>Clear target: <strong className="text-slate-600 font-semibold">{b.expiresAt}</strong></span>
                              </div>
                              {b.contact && (
                                <div className="text-[10px] text-slate-400 font-bold font-sans">Provider Contact Coordinate: {b.contact}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 self-end md:self-center">
                              <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg shrink-0">
                                Active Vault Slot
                              </span>
                              <button
                                onClick={() => deleteColdStorage(b.id!)}
                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-lg transition-all shrink-0 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Rules / warnings of the SciTech repository */}
                <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-5 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-neutral-805">
                    <h5 className="font-semibold text-neutral-900 font-sans">RUET Campus Student Storage Guidelines</h5>
                    <p className="leading-relaxed text-neutral-600">
                      Cold Locker storage allocations are security-monitored. Organic student supplements and food blocks must use standard sealed containers. Always notify the facility operator prior to checkout coordinate.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 4: SAFETY EQUIPMENT MARKETSTORE */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'safety' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900">RUET Campus Safe-Walk & Girls Safety Depot</h2>
                <p className="text-xs text-neutral-500 mt-1">Acquire self-defense gear, custom lab coats, safety sirens, and access student safe companion networks at RUET Kazla Campus.</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 px-3 py-1.5 rounded-lg">
                ✓ Student Union Safety Initiative (RUET)
              </span>
            </div>

            {/* Quick emergency notice for RUET female students */}
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex gap-3 text-xs text-rose-950 items-start">
              <span className="text-lg">📢</span>
              <div>
                <p className="font-bold">RUET Safe-Teammate Companion & Escort Program</p>
                <p className="mt-1">
                  Walking back late from departmental labs to Kazla, Binodpur, or Talaimari? Call our volunteer coordinator team at <strong>+880 1712-XXXXXX</strong> or order a zero-cost <strong>Night Walk Escort Card</strong> below to automatically schedule a volunteer companion to walk with you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Checkout Form */}
              <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-xs space-y-4 col-span-1">
                <h3 className="font-sans font-bold text-neutral-900 text-sm">Request Safety Kit / Gear</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Select Equipment</label>
                    <select
                      value={selectedSafetyGear}
                      onChange={(e) => setSelectedSafetyGear(e.target.value)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2"
                    >
                      <option value="Siren (৳350)">LED Corridor Torch & Keychain Siren — ৳350</option>
                      <option value="Panic Button (৳450)">Portable Student Panic Button — ৳450</option>
                      <option value="Pepper Spray (৳250)">Refillable Female Pepper Spray (Kazla Depot) — ৳250</option>
                      <option value="Apron (৳600)">Female Lab Apron & Protective Goggles — ৳600</option>
                      <option value="Reflective Vest (৳400)">Night Reflective Vest (RUET Logo) — ৳400</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Size Option</label>
                      <select
                        value={safetySize}
                        onChange={(e) => setSafetySize(e.target.value)}
                        className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2"
                      >
                        <option value="S">Small (S)</option>
                        <option value="M">Medium (M)</option>
                        <option value="L">Large (L)</option>
                        <option value="XL">Extra Large (XL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={safetyGearQty}
                        onChange={(e) => setSafetyGearQty(Math.max(1, Number(e.target.value)))}
                        className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs flex justify-between items-center">
                  <span className="text-neutral-500 font-medium">Calculated Cost</span>
                  <span className="font-bold text-neutral-900 font-mono">
                    ৳{(() => {
                      let price = 350;
                      if (selectedSafetyGear.includes("Button") || selectedSafetyGear.includes("Panic")) price = 450;
                      if (selectedSafetyGear.includes("Pepper") || selectedSafetyGear.includes("Spray")) price = 250;
                      if (selectedSafetyGear.includes("Apron") || selectedSafetyGear.includes("Combo")) price = 600;
                      if (selectedSafetyGear.includes("Reflective") || selectedSafetyGear.includes("Vest") || selectedSafetyGear.includes("vest")) price = 400;
                      return price * safetyGearQty;
                    })()}
                  </span>
                </div>

                <button
                  onClick={checkoutSafetyOrder}
                  className="w-full py-2.5 text-xs font-bold bg-neutral-900 hover:bg-black text-white rounded-lg transition-all"
                >
                  Order for Pick-Up
                </button>
              </div>

              {/* Transactions / Pickup boards */}
              <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-neutral-100 shadow-xs space-y-4">
                <h3 className="font-sans font-bold text-neutral-900 text-sm">My Active Safety Wear Depot Receipts ({safetyOrders.length})</h3>

                {safetyOrders.length === 0 ? (
                  <p className="text-xs text-neutral-400 leading-relaxed py-6 text-center">No active safety gear depot transactions processed yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {safetyOrders.map(o => (
                      <div key={o.id} className="p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-1">
                          <h4 className="text-xs font-sans font-bold text-neutral-900">{o.itemName}</h4>
                          <div className="flex gap-3 text-[10px] font-mono text-neutral-400">
                            <span>Qty: {o.quantity}</span>
                            <span>| Size: {o.size}</span>
                            <span>| Total pricing: ৳{o.priceTotal}</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Order ID Reference: DB-{o.id?.substr(0, 8)}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold font-mono uppercase ${
                            o.pickupStatus === 'picked_up' ? 'bg-neutral-100 text-neutral-400' :
                            o.pickupStatus === 'ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {o.pickupStatus?.replace('_', ' ')}
                          </span>

                          {/* Quick Admin action simulators */}
                          {o.pickupStatus === 'pending' && (
                            <button
                              onClick={() => updateSafetyPickup(o.id!, 'ready')}
                              className="text-[10px] bg-neutral-900 text-white px-2 py-1 rounded-sm font-semibold hover:bg-black transition-colors"
                            >
                              Ready Pickup
                            </button>
                          )}
                          {o.pickupStatus === 'ready' && (
                            <button
                              onClick={() => updateSafetyPickup(o.id!, 'picked_up')}
                              className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded-sm font-semibold hover:bg-emerald-700 transition-colors"
                            >
                              Confirm Pickup
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 5: CAMPUS CAREERS PORTAL */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'career' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">Campus Careers Portal</h2>
              <p className="text-xs text-neutral-500 mt-1">Browse internal student positions and test dispatch cover letters using cloud Firestore.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Interactive Jobs List items selectors */}
              <div className="space-y-3 col-span-1">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-400">Available Campus Contracts</span>
                {PRESET_JOBS.map(job => {
                  const isSelected = selectedJob.id === job.id;
                  return (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        isSelected ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' : 'bg-white text-neutral-700 border-neutral-100 hover:bg-neutral-50/50'
                      }`}
                    >
                      <h4 className="text-xs font-bold font-sans">{job.title}</h4>
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className={isSelected ? 'text-neutral-300' : 'text-neutral-500'}>{job.company}</span>
                        <span className={isSelected ? 'text-white font-bold' : 'text-neutral-800'}>{job.salaryRange}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* View details & apply details */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                
                <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-xs space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-semibold">{selectedJob.department}</span>
                    <h3 className="font-sans font-bold text-lg text-neutral-900 mt-0.5">{selectedJob.title}</h3>
                    <p className="text-xs font-semibold text-neutral-700 mt-1 font-mono">{selectedJob.company} • {selectedJob.location}</p>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed font-sans pb-3 border-b border-neutral-100">
                    {selectedJob.description}
                  </p>

                  <div className="space-y-2">
                    <label className="block text-neutral-400 font-mono text-[10px] uppercase">My Application Cover Letter / Highlights</label>
                    <textarea
                      rows={4}
                      placeholder="Explain why your experience with React setups, data models, or lab coordinate tracking makes you the perfect academic candidate..."
                      value={coverLetterInput}
                      onChange={(e) => setCoverLetterInput(e.target.value)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-lg p-3 font-sans outline-hidden"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={submitCareerApplication}
                      className="px-6 py-2.5 bg-neutral-900 text-white hover:bg-black font-semibold text-xs rounded-lg transition-all"
                    >
                      Submit Job Cover Letter
                    </button>
                  </div>
                </div>

                {/* Submissions tracking records */}
                <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-xs space-y-3">
                  <h3 className="font-sans font-bold text-neutral-900 text-sm">My Sent Career Applications ({jobApplications.length})</h3>

                  {jobApplications.length === 0 ? (
                    <p className="text-xs text-neutral-400 text-center py-4">No active applications filed. Submit letters on selected jobs to view tracking logs.</p>
                  ) : (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto">
                      {jobApplications.map(app => (
                        <div key={app.id} className="p-4 border border-neutral-100 rounded-lg flex justify-between items-center bg-neutral-50/20">
                          <div>
                            <h4 className="text-xs font-bold text-neutral-900">{app.jobTitle}</h4>
                            <p className="text-[11px] text-neutral-500">{app.company} • Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
                            <p className="text-[11px] italic text-neutral-400 mt-1">"Cover: {app.coverLetter}"</p>
                          </div>
                          <div>
                            <span className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider bg-neutral-900 text-white rounded-sm uppercase">
                              {app.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 6: SHUTTLE TRANSIT LOGISTICS */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'transit' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">Campus Shuttle Transit Logistics</h2>
              <p className="text-xs text-neutral-500 mt-1">Schedule transit timings and generate dynamic QR tickets to access college perimeter routes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Ticket generation Panel */}
              <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-xs space-y-4">
                <h3 className="font-sans font-bold text-neutral-900 text-sm">Generate QR Boarding Ticket</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Select Active Shuttle Line Route</label>
                    <select
                      value={transitRouteId}
                      onChange={(e) => setTransitRouteId(e.target.value)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2"
                    >
                      {PRESET_SHUTTLES.map(shuttle => (
                        <option key={shuttle.id} value={shuttle.id}>{shuttle.routeName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Override Departure (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 08:30 AM (or leave default)"
                      value={departureDateOption}
                      onChange={(e) => setDepartureDateOption(e.target.value)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2"
                    />
                  </div>
                </div>

                {(() => {
                  const s = PRESET_SHUTTLES.find(item => item.id === transitRouteId);
                  if (!s) return null;
                  return (
                    <div className="p-3 bg-neutral-50 rounded-lg space-y-1.5 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-neutral-500">Departure</span>
                        <span className="text-neutral-800">{s.departureTime}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-neutral-500">Frequency</span>
                        <span className="text-neutral-800">Every {s.frequencyMinutes} Mins</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-neutral-500">Days Active</span>
                        <span className="text-neutral-800">{s.days}</span>
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={submitTransitBooking}
                  className="w-full py-2.5 text-xs font-bold bg-neutral-900 hover:bg-black text-white rounded-lg transition-all"
                >
                  Generate Pass Ticket
                </button>
              </div>

              {/* Active Ticket displaying column */}
              <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-neutral-100 shadow-xs space-y-4">
                <h3 className="font-sans font-bold text-neutral-900 text-sm">Active Transit Tickets ({shuttleBookings.length})</h3>

                {shuttleBookings.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-6 leading-relaxed">No QR Shuttle boarding passes booked. Customize select transit lines to render passes.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto">
                    {shuttleBookings.map(t => (
                      <div key={t.id} className="p-5 border border-neutral-150 rounded-xl bg-neutral-50/30 font-sans flex flex-col justify-between h-52 relative overflow-hidden">
                        
                        {/* Dynamic aesthetic visual ticket elements */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-neutral-900 text-white rounded-bl-3xl flex items-center justify-center">
                          <QrCode className="w-6 h-6" />
                        </div>

                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-semibold font-mono text-neutral-400">Campus Boarding Voucher</span>
                          <h4 className="text-xs font-bold text-neutral-800 mt-1 leading-snug">{t.routeName}</h4>
                          <div className="text-[10px] font-mono text-neutral-500 mt-2">
                            <p>From: {t.stopFrom}</p>
                            <p>To: {t.stopTo}</p>
                            <p className="font-semibold text-neutral-700 mt-1">Leaves: {t.departureTime}</p>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-neutral-200 pt-3 flex justify-between items-center text-[10px] font-mono">
                          <div>
                            <span className="block text-neutral-400 text-[8px] uppercase">Passcode</span>
                            <span className="text-neutral-900 font-bold">{t.qrCode}</span>
                          </div>
                          <button
                            onClick={() => deleteShuttleTicket(t.id!)}
                            className="bg-red-50 text-red-600 px-2 py-1 rounded-sm font-semibold hover:bg-red-100 transition-all font-sans text-[10px]"
                          >
                            Cancel Pass
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 7: NUTRITION / PROTEIN MEALS LOGGING */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'protein' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900">Protein Nutrition Goal Logs & Meals</h2>
                <p className="text-xs text-neutral-500 mt-1">Coordinate daily nutrition totals and set custom targets to maximize workout performance.</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={proteinGoalGoal}
                  onChange={(e) => setProteinGoalGoal(Number(e.target.value))}
                  className="w-20 text-xs bg-white border border-neutral-205 rounded-lg p-2 font-mono text-center font-bold"
                />
                <button
                  onClick={updateGoalSetting}
                  className="px-4 py-2 bg-neutral-950 text-white rounded-lg text-xs font-bold font-sans hover:bg-black"
                >
                  Set Protein target (g)
                </button>
              </div>
            </div>

            {/* Protein metrics analytics summary widget */}
            {mealSubscription && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl border border-neutral-100 shadow-xs">
                
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Total Food Log entries</span>
                  <p className="font-sans font-bold text-2xl text-neutral-900">{mealSubscription.mealsCount} Active Logged Meals</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Total Protein Tracked Today</span>
                  <p className="font-sans font-bold text-2xl text-emerald-600">
                    {mealSubscription.meals?.reduce((acc, m) => acc + m.proteinGrams, 0) || 0}g / {proteinGoalGoal}g
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Average Protein / Entry</span>
                  <p className="font-sans font-bold text-2xl text-neutral-800">
                    {mealSubscription.mealsCount > 0 
                      ? Math.round((mealSubscription.meals?.reduce((acc, m) => acc + m.proteinGrams, 0) || 0) / mealSubscription.mealsCount) 
                      : 0}g
                  </p>
                </div>

              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Preset high protein meal orders logger */}
              <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-xs space-y-4">
                <h3 className="font-sans font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-neutral-900" />
                  Meal Marketplace presets
                </h3>

                <div className="space-y-3.5">
                  {PRESET_PROTEIN_MEALS.map(meal => (
                    <div key={meal.id} className="p-3 border border-neutral-100 rounded-lg hover:border-neutral-300 transition-colors flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-sans font-bold text-neutral-900 leading-tight">{meal.name}</span>
                        <span className="font-mono text-[11px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-sm font-semibold">৳{meal.price}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">{meal.description}</p>
                      <div className="flex justify-between items-center text-[10px] font-mono mt-1 pt-1 border-t border-neutral-50">
                        <span className="text-neutral-700 font-bold bg-neutral-100 px-1.5 py-0.5 rounded-sm">Protein: {meal.proteinGrams}g</span>
                        <span className="text-neutral-400">Heat: {meal.calories} kcal</span>
                        <button
                          onClick={() => addProteinTrackingMeal(meal)}
                          className="bg-neutral-900 text-white font-bold px-2 py-1 rounded-sm hover:bg-black transition-all text-[9px] uppercase tracking-wider"
                        >
                          Log Intake
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom meal intake inputs and general meal log progress lists */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                
                {/* Custom input logging */}
                <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-xs space-y-4">
                  <h3 className="font-sans font-bold text-neutral-900 text-sm">Log Custom Student Meal</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Meal Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Whey protein shake + oats"
                        value={customMealName}
                        onChange={(e) => setCustomMealName(e.target.value)}
                        className="w-full text-xs bg-neutral-50 border border-neutral-202 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Protein grams (g)</label>
                      <input
                        type="number"
                        value={customMealProtein}
                        onChange={(e) => setCustomMealProtein(Number(e.target.value))}
                        className="w-full text-xs bg-neutral-50 border border-neutral-202 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Calories estimate (kcal)</label>
                      <input
                        type="number"
                        value={customMealCalories}
                        onChange={(e) => setCustomMealCalories(Number(e.target.value))}
                        className="w-full text-xs bg-neutral-50 border border-neutral-202 rounded-lg p-2"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => addProteinTrackingMeal()}
                      className="px-6 py-2 bg-neutral-900 text-white font-bold text-xs rounded-lg hover:bg-black transition-all"
                    >
                      Record Custom Intake
                    </button>
                  </div>
                </div>

                {/* Logged lists */}
                <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-xs space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                    <h3 className="font-sans font-bold text-neutral-900 text-sm">Active Dietary Log Bookings</h3>
                    <button
                      onClick={resetAllMeals}
                      className="text-[11px] text-neutral-400 hover:text-red-600 font-bold font-mono"
                    >
                      Reset Daily counter
                    </button>
                  </div>

                  {(!mealSubscription || !mealSubscription.meals || mealSubscription.meals.length === 0) ? (
                    <p className="text-xs text-neutral-400 py-6 text-center leading-relaxed">No meal intake logs saved today on Firestore. Start logging items above!</p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                      {mealSubscription.meals.map((m, idx) => (
                        <div key={idx} className="p-3 border border-neutral-100 hover:bg-neutral-50/50 rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-neutral-900 text-xs">{m.mealName}</span>
                            <span className="text-[11px] text-neutral-400 font-mono block">Logged: {m.loggedAt}</span>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <span className="inline-block bg-neutral-900 text-white px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-wider font-mono font-bold">
                                +{m.proteinGrams}g Protein
                              </span>
                              <span className="block text-[11px] text-neutral-400 font-mono mt-0.5">{m.calories} kcal</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 8: PEER TO PEER TRADING STUDENT MARKETPLACE */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 font-sans">RUET Peer Student Hub C2C Marketplace</h2>
                <p className="text-xs text-neutral-500 mt-1">Acquire engineering instruments, exchange class guides/lab manuals, buy dormitory furniture, or donate old clothing on campus.</p>
              </div>
              <span className="text-xs font-bold font-mono bg-[#EBF5FF] text-[#0066CC] border border-[#CCE5FF] px-3 py-1.5 rounded-lg shrink-0">
                Kazla Trade Board (৳ BDT)
              </span>
            </div>

            {/* Quick search & category filter row */}
            <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-450" />
                <input
                  type="text"
                  placeholder="Query scientific calculator, hoodies, fan, table..."
                  value={marketplaceSearch}
                  onChange={(e) => setMarketplaceSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-neutral-200 rounded-lg placeholder-neutral-400 focus:border-stone-900 focus:outline-none transition-colors"
                />
              </div>
              
              <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto h-9 items-center no-scrollbar">
                {['All', 'Academic', 'Electronics', 'Hostel & Room Essentials', 'Transportation', 'Clothing', 'Fitness', 'Community'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setMarketplaceFilterCategory(cat)}
                    className={`px-3 py-1 text-[11px] font-sans font-bold rounded-lg shrink-0 transition-all ${
                      marketplaceFilterCategory === cat 
                        ? 'bg-neutral-900 text-white shadow-3xs' 
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Publish Item listing card */}
              <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-xs space-y-4">
                <div className="border-b border-neutral-100 pb-2">
                  <h3 className="font-sans font-bold text-neutral-900 text-sm">Post Item for Trade / Sale</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Publish engineering gears or notes instantly to find local student buyers.</p>
                </div>
                
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Item Title / Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Thomas Calculus 14th Edition copy"
                      value={marketTitle}
                      onChange={(e) => setMarketTitle(e.target.value)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1 flex justify-between">
                        <span>Price (৳ BDT)</span>
                        {marketDonationOption && <span className="text-blue-600 font-extrabold uppercase text-[8px]">Free</span>}
                      </label>
                      <input
                        type="number"
                        disabled={marketDonationOption}
                        value={marketDonationOption ? 0 : marketPrice}
                        onChange={(e) => setMarketPrice(Number(e.target.value))}
                        className={`w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono ${marketDonationOption ? 'text-neutral-400 line-through' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Item Condition</label>
                      <select
                        value={marketCondition}
                        onChange={(e) => setMarketCondition(e.target.value as any)}
                        className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2 focus:bg-white focus:border-neutral-900 focus:outline-none font-medium text-neutral-850"
                      >
                        <option value="New">Brand New</option>
                        <option value="Like New">Like New</option>
                        <option value="Very Good">Very Good</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Category Classification</label>
                    <select
                      value={marketCategory}
                      onChange={(e) => setMarketCategory(e.target.value)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2 focus:bg-white focus:border-neutral-900 focus:outline-none font-medium text-neutral-850"
                    >
                      <option value="Academic">Academic (Books, Guides, Drawing Tools)</option>
                      <option value="Electronics">Electronics (Laptops, Calculators, Devices)</option>
                      <option value="Hostel & Room Essentials">Hostel & Room (Tables, Fans, Mattresses)</option>
                      <option value="Transportation">Transportation (Bicycle, Accessory)</option>
                      <option value="Clothing">Clothing (Jackets, Hoodies, Shoes)</option>
                      <option value="Fitness">Fitness (Meters, Bands, Protein Shakers)</option>
                      <option value="Entertainment">Entertainment (Gaming, Speakers)</option>
                      <option value="Community">Community (Lost & Found, Urgent trades)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1 flex justify-between">
                      <span>Product Image Link</span>
                      <span className="text-[9px] text-neutral-400">Optional</span>
                    </label>
                    <input
                      type="url"
                      placeholder="Paste high-quality online picture URL..."
                      value={marketImageUrl}
                      onChange={(e) => setMarketImageUrl(e.target.value)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono"
                    />
                  </div>

                  {/* Pricing/Deal toggles */}
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-neutral-700">Allow price negotiation?</span>
                      <input
                        type="checkbox"
                        checked={marketNegotiable}
                        onChange={(e) => setMarketNegotiable(e.target.checked)}
                        className="w-3.5 h-3.5 accent-neutral-900 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] border-t border-neutral-150 pt-2 pb-0.5">
                      <span className="font-bold text-neutral-700">Is this a Free donation?</span>
                      <input
                        type="checkbox"
                        checked={marketDonationOption}
                        onChange={(e) => {
                          setMarketDonationOption(e.target.checked);
                          if (e.target.checked) setMarketPrice(0);
                        }}
                        className="w-3.5 h-3.5 accent-neutral-900 cursor-pointer"
                      />
                    </div>

                    <div className="border-t border-neutral-150 pt-2">
                      <label className="block text-neutral-500 font-mono text-[10px] uppercase mb-1">Exchange Barter Wanted (Target Items)</label>
                      <input
                        type="text"
                        placeholder="e.g. Want professional T-scale ruler in return"
                        value={marketExchangeRequested}
                        onChange={(e) => setMarketExchangeRequested(e.target.value)}
                        className="w-full text-[11px] bg-white border border-neutral-200 rounded-md p-1.5 focus:border-stone-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Short Description / Contact info</label>
                    <textarea
                      rows={3}
                      placeholder="Include details e.g. Phone number, Kazla hostel name, and collection slot."
                      value={marketDesc}
                      onChange={(e) => setMarketDesc(e.target.value)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={publishMarketItem}
                  className="w-full py-2.5 text-xs font-bold bg-neutral-900 hover:bg-black text-white rounded-lg transition-all shadow-xs"
                >
                  Publish Trade Listing
                </button>
              </div>

              {/* Right Column: Browse listings cards */}
              <div className="col-span-1 lg:col-span-2 space-y-4">
                
                {/* Active and filtered listings header count */}
                <div className="flex justify-between items-center bg-stone-50 border border-neutral-200 p-3 rounded-lg">
                  <h3 className="font-sans font-bold text-neutral-800 text-sm">
                    {marketplaceFilterCategory} Items Trade Board ({
                      marketplaceItems.filter(item => {
                        const mS = item.title.toLowerCase().includes(marketplaceSearch.toLowerCase()) || 
                                   item.description.toLowerCase().includes(marketplaceSearch.toLowerCase());
                        const mCat = marketplaceFilterCategory === 'All' || item.category === marketplaceFilterCategory;
                        return mS && mCat && !item.reported;
                      }).length
                    })
                  </h3>
                  <span className="text-[9px] text-[#0066CC] font-mono bg-[#EBF5FF] px-2 py-0.5 rounded-sm font-bold">Cloud Sync Enabled</span>
                </div>

                {marketplaceItems.filter(item => {
                  const mS = item.title.toLowerCase().includes(marketplaceSearch.toLowerCase()) || 
                             item.description.toLowerCase().includes(marketplaceSearch.toLowerCase());
                  const mCat = marketplaceFilterCategory === 'All' || item.category === marketplaceFilterCategory;
                  return mS && mCat && !item.reported;
                }).length === 0 ? (
                  <div className="bg-white border border-neutral-100 rounded-2xl p-16 text-center space-y-2">
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">No matching trade listings found under the selected category filters. Create a new C2C post on the left layout side to start.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-1">
                    {marketplaceItems
                      .filter(item => {
                        const mS = item.title.toLowerCase().includes(marketplaceSearch.toLowerCase()) || 
                                   item.description.toLowerCase().includes(marketplaceSearch.toLowerCase());
                        const mCat = marketplaceFilterCategory === 'All' || item.category === marketplaceFilterCategory;
                        return mS && mCat && !item.reported;
                      })
                      .map(item => {
                        const isSaved = item.savedBy?.includes(currentUser.uid) || false;
                        return (
                          <div
                            key={item.id}
                            onMouseEnter={() => trackViewsMarketItem(item.id!)}
                            className="bg-white border border-neutral-100 hover:border-neutral-200 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all relative group animate-[fadeIn_0.15s_ease-out]"
                          >
                            {/* Product Image and Meta tags */}
                            <div className="space-y-2.5">
                              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-neutral-100 border border-neutral-150">
                                <img
                                  src={item.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                                  alt={item.title}
                                  referrerPolicy="no-referrer"
                                  className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-250"
                                />
                                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                  <span className="text-[8px] uppercase tracking-wider font-mono font-extrabold bg-[#090D16] text-white px-2 py-0.5 rounded-sm">
                                    {item.category}
                                  </span>
                                  <span className="text-[8px] uppercase tracking-wider font-mono font-extrabold bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded-sm border border-stone-200">
                                    {item.condition}
                                  </span>
                                </div>
                                <button
                                  onClick={() => toggleSaveMarketItem(item.id!, isSaved)}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 hover:bg-white text-yellow-500 shadow-3xs cursor-pointer active:scale-95 transition-all"
                                  title="Save Favorite"
                                >
                                  {isSaved ? (
                                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                  ) : (
                                    <Star className="w-3.5 h-3.5 text-neutral-400 group-hover:text-yellow-500 transition-colors" />
                                  )}
                                </button>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-sans font-bold text-xs text-neutral-900 leading-snug group-hover:text-neutral-950 transition-colors">{item.title}</h4>
                                  <span className="font-mono font-extrabold text-neutral-900 text-xs shrink-0 bg-neutral-50 px-1.5 py-0.5 rounded-md border border-neutral-150">
                                    {item.donationOption ? 'FREE' : `৳${item.price}`}
                                  </span>
                                </div>

                                <p className="text-[11px] text-neutral-600 leading-relaxed font-sans mt-1 line-clamp-2">
                                  "{item.description}"
                                </p>
                              </div>

                              {/* Badges for transaction modes */}
                              <div className="flex flex-wrap gap-1 pt-1">
                                {item.negotiable && (
                                  <span className="text-[8px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded-xs">
                                    ৳ Price Negotiable
                                  </span>
                                )}
                                {item.donationOption && (
                                  <span className="text-[8px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-xs">
                                    Gift/Donation
                                  </span>
                                )}
                                {item.exchangeRequested && (
                                  <span className="text-[8px] font-mono font-bold bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-sm truncate max-w-[200px]" title={`Wants in exchange: ${item.exchangeRequested}`}>
                                    Barter exchange: {item.exchangeRequested}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Seller identity and actionable footer blocks */}
                            <div className="space-y-2 mt-3.5 border-t border-neutral-100 pt-2.5">
                              <div className="flex justify-between items-center text-[9px] font-mono text-neutral-450">
                                <span className="truncate max-w-[130px]" title={`Seller: ${item.sellerName}`}>Contact: {item.sellerName}</span>
                                <span className="flex items-center gap-1 shrink-0">
                                  <Eye className="w-3 h-3" /> {item.viewsCount || 1} views
                                </span>
                              </div>

                              <div className="flex gap-1.5 justify-between items-center flex-wrap pt-1">
                                <button
                                  onClick={() => {
                                    alert(`Seller Contact Details:\nName: ${item.sellerName}\nEmail: ${item.sellerEmail}\n\nPlease email them directly or coordinate in RUET common mess terminals.`);
                                  }}
                                  className="p-1 rounded-md bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 border border-neutral-200 text-[10px] font-medium transition-colors"
                                  title="Contact details"
                                >
                                  Contact Seller
                                </button>

                                <div className="flex gap-1 items-center">
                                  {/* Report listing */}
                                  <button
                                    onClick={() => {
                                      if (confirm("Report this listing for spam or inappropriate guidelines match?")) {
                                        reportMarketItem(item.id!);
                                        alert("Thank you. Listing reported.");
                                      }
                                    }}
                                    className="p-1 px-1.5 text-[9px] text-neutral-400 hover:text-red-650 hover:bg-red-50 rounded-sm transition-colors"
                                    title="Report item"
                                  >
                                    Report
                                  </button>

                                  {item.isSold ? (
                                    <span className="text-[9px] font-mono uppercase bg-neutral-100 text-neutral-400 font-extrabold px-2 py-1 rounded-sm border border-neutral-200">
                                      ✓ SOLD
                                    </span>
                                  ) : (
                                    <>
                                      {item.sellerId === currentUser.uid ? (
                                        <button
                                          onClick={() => buyOrMarkSoldMarketItem(item.id!, true)}
                                          className="bg-neutral-900 hover:bg-black text-white text-[9px] font-mono font-bold px-2 py-1 rounded-sm shadow-xs transition-colors"
                                        >
                                          Mark Sold
                                        </button>
                                      ) : (
                                        <div className="flex gap-1">
                                          {item.negotiable && (
                                            <button
                                              onClick={() => {
                                                const proposedStr = prompt(`Item listed at ৳${item.price}. Enter your proposed deal price in BDT Taka:`);
                                                if (proposedStr) {
                                                  const val = Number(proposedStr);
                                                  if (!isNaN(val)) {
                                                    negotiatePriceMarketItem(item.id!, val);
                                                    alert(`Your BDT offer of ৳${val} has been sent! Check response update soon.`);
                                                  }
                                                }
                                              }}
                                              className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[9px] font-sans font-bold px-2 py-1 rounded-xs transition-colors"
                                            >
                                              Propose ৳
                                            </button>
                                          )}
                                          {item.exchangeRequested && (
                                            <button
                                              onClick={() => {
                                                const offerStr = prompt(`Seller listed exchange target: "${item.exchangeRequested}". What item inside RUET do you offer to barter?`);
                                                if (offerStr) {
                                                  exchangeRequestMarketItem(item.id!, offerStr);
                                                  alert("Your barter exchange offer registration saved!");
                                                }
                                              }}
                                              className="bg-[#EEF2FF] hover:bg-indigo-100 text-[#4F46E5] text-[9px] font-sans font-bold px-2 py-1 rounded-xs transition-colors"
                                            >
                                              Barter
                                            </button>
                                          )}
                                          <button
                                            onClick={() => buyOrMarkSoldMarketItem(item.id!, true)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-sans font-bold px-2 py-1 rounded-xs transition-colors"
                                          >
                                            Buy Now
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 9: DORM LAUNDRY SERVICE SCHEDULER */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'laundry' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#1E293B] tracking-tight">RUET Student & Hostel Laundry Hub</h2>
                <p className="text-xs text-slate-500 mt-1">Convenient pickup, meticulous garment sorting, dynamic care plans, and real-time delivery scheduling for RUET campus hostels.</p>
              </div>
              <span className="text-xs font-bold font-mono bg-[#0B0F19] text-white px-4 py-2 rounded-xl shadow-sm">
                Hostel Collection Service Active ✓
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Laundry Booking Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-3xs space-y-4">
                <div className="border-b border-slate-50 pb-3">
                  <h3 className="font-display font-extrabold text-slate-900 text-sm">Schedule Pickup & Laundry Care</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Select a specialized care plan or regular weight-based washing parameters.</p>
                </div>
                
                <div className="space-y-4 text-xs">
                  {/* Service Tier Dropdown */}
                  <div>
                    <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Service Tier or hostel package</label>
                    <select
                      value={laundryTypeSelection}
                      onChange={(e) => setLaundryTypeSelection(e.target.value)}
                      className="w-full text-xs bg-slate-550 border border-slate-100 focus:border-blue-500 rounded-xl p-3 outline-none cursor-pointer font-semibold"
                    >
                      <optgroup label="Standard BDT Weight Tiers (per kg)">
                        <option value="Wash Only">Wash Only (৳15/Kg)</option>
                        <option value="Wash & Dry">Wash & Dry (৳25/Kg)</option>
                        <option value="Wash, Dry & Fold">Wash, Dry & Fold (৳35/Kg)</option>
                        <option value="Wash, Dry & Iron">Wash, Dry & Iron (৳45/Kg)</option>
                        <option value="Ironing Only">Ironing Only (৳10/Kg)</option>
                        <option value="Dry Cleaning">Dry Cleaning (৳80/Kg)</option>
                        <option value="Express Laundry">Express Laundry - 12hr (৳55/Kg)</option>
                        <option value="Same-Day Laundry">Same-Day - 6hr (৳70/Kg)</option>
                      </optgroup>
                      <optgroup label="Student Hostel Fixed Packages">
                        <option value="Hostel Basic Package">Hostel Basic Program (৳400/mo flat - up to 15 Kg)</option>
                        <option value="Hostel Premium Package">Hostel Premium Program (৳750/mo flat - up to 30 Kg)</option>
                        <option value="Weekly Laundry Plan">Weekly Student Plan (৳250/wk flat)</option>
                        <option value="Monthly Laundry Subscription">Monthly Unlimited Sub (৳1200/mo flat)</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Weight slider/numeric input */}
                  <div>
                    <label className="block text-slate-550 font-mono text-[10px] uppercase mb-2 font-bold flex justify-between">
                      <span>Bag / Load Weight</span>
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{laundryLbs} Kg</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={laundryLbs}
                      onChange={(e) => setLaundryLbs(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
                      <span>1 Kg</span>
                      <span>15 Kg (Standard limit)</span>
                      <span>30 Kg (Max)</span>
                    </div>
                  </div>

                  {/* Micro Sorters Selection Grids */}
                  <div className="grid grid-cols-2 gap-3.5 border-t border-slate-50 pt-3.5">
                    <div>
                      <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Color sorting mode</label>
                      <select
                        value={laundryColorSorting}
                        onChange={(e) => setLaundryColorSorting(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-xl p-2.5 outline-none"
                      >
                        <option value="White Clothes">White Clothes Only</option>
                        <option value="Light Colors">Light Colors</option>
                        <option value="Dark Colors">Dark Colors</option>
                        <option value="Mixed Loads">Mixed Colors</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Fabric sorting mode</label>
                      <select
                        value={laundryFabricSorting}
                        onChange={(e) => setLaundryFabricSorting(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-xl p-2.5 outline-none"
                      >
                        <option value="Cotton">Premium Cotton</option>
                        <option value="Polyester">Polyester Blend</option>
                        <option value="Wool">Sensitive Wool</option>
                        <option value="Denim">Heavy Denim / Drill</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Primary clothing item</label>
                      <select
                        value={laundryClothingType}
                        onChange={(e) => setLaundryClothingType(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-xl p-2.5 outline-none"
                      >
                        <option value="T-Shirts">T-Shirts / Polos</option>
                        <option value="Shirts">Formal Wear / Shirts</option>
                        <option value="Pants">Jeans / Gabardine Pants</option>
                        <option value="Hoodies">Hoodies / Outerwear</option>
                        <option value="Bedsheets">Bedsheets & Linens</option>
                        <option value="Towels">Bath Towels</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Care & Wash Details</label>
                      <select
                        value={laundryCareInstructions}
                        onChange={(e) => setLaundryCareInstructions(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-xl p-2.5 outline-none"
                      >
                        <option value="Normal Wash">Normal Wash Cycle</option>
                        <option value="Delicate Wash">Delicate Gentle Wash</option>
                        <option value="Hand Wash Required">Hand Wash Simulation</option>
                        <option value="Dry Clean Only">Chemical Dry Clean Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-3.5">
                    <div>
                      <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Pickup target time</label>
                      <input
                        type="datetime-local"
                        required
                        value={laundryPickupTime}
                        onChange={(e) => setLaundryPickupTime(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-xl p-2.5 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Delivery target time</label>
                      <input
                        type="datetime-local"
                        value={laundryDeliveryTime}
                        onChange={(e) => setLaundryDeliveryTime(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-xl p-2.5 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-550 font-mono text-[10px] uppercase mb-1.5 font-bold">Fragrance / Hostel details</label>
                    <input
                      type="text"
                      placeholder="e.g. Lavender fabric softener, Hall-3 Room 402 pickup"
                      value={laundryNotesInput}
                      onChange={(e) => setLaundryNotesInput(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-xl p-3 outline-none"
                    />
                  </div>
                </div>

                {/* Pricing Summary Widget */}
                {(() => {
                  let flatPrice = 0;
                  let isFlat = false;
                  if (laundryTypeSelection === 'Hostel Basic Package') { flatPrice = 400; isFlat = true; }
                  else if (laundryTypeSelection === 'Hostel Premium Package') { flatPrice = 750; isFlat = true; }
                  else if (laundryTypeSelection === 'Weekly Laundry Plan') { flatPrice = 250; isFlat = true; }
                  else if (laundryTypeSelection === 'Monthly Laundry Subscription') { flatPrice = 1200; isFlat = true; }
                  
                  let rateValue = 15;
                  if (laundryTypeSelection === 'Wash & Dry') rateValue = 25;
                  else if (laundryTypeSelection === 'Wash, Dry & Fold') rateValue = 35;
                  else if (laundryTypeSelection === 'Wash, Dry & Iron') rateValue = 45;
                  else if (laundryTypeSelection === 'Ironing Only') rateValue = 10;
                  else if (laundryTypeSelection === 'Dry Cleaning') rateValue = 80;
                  else if (laundryTypeSelection === 'Express Laundry') rateValue = 55;
                  else if (laundryTypeSelection === 'Same-Day Laundry') rateValue = 70;

                  const totalEstimate = isFlat ? flatPrice : laundryLbs * rateValue;

                  return (
                    <div className="p-3.5 bg-[#FAFBFD] rounded-xl border border-slate-100 space-y-1.5 shadow-3xs">
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Rate computation details</div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Billing Category:</span>
                        <span className="font-bold text-slate-900">{laundryTypeSelection}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Load Parameter:</span>
                        <span className="font-mono text-slate-850 font-semibold">{isFlat ? "Hostel Bundle Plan" : `${laundryLbs} Kg × ৳${rateValue}`}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2 mt-2">
                        <span className="font-bold text-slate-900">Fee Sum:</span>
                        <span className="font-mono font-extrabold text-blue-600 text-sm">৳{totalEstimate} BDT</span>
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={submitLaundryServiceOrder}
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-[#0B0F19] hover:bg-[#1E293B] text-white rounded-xl transition-all cursor-pointer shadow-sm shadow-[#0B0F19]/25 text-center"
                >
                  Create pickup scheduler
                </button>
              </div>

              {/* Running laundry cards displaying and steps markers */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                
                {/* Visual indicator of Laundry reservations */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-3xs space-y-4">
                  <h3 className="font-display font-extrabold text-[#1E293B] text-sm">Active Laundry Reservation Milestones ({laundryBookings.length})</h3>

                  {laundryBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                        <Shirt className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">No current hostel laundry orders are registered in the Firestore pipeline. Use the control panel to book your first collection schedule.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                      {laundryBookings.map(b => (
                        <div key={b.id} className="p-5 border border-slate-100 hover:border-slate-150 rounded-2xl hover:bg-slate-50/25 space-y-4 shadow-3xs transition-all animate-[fadeIn_0.15s_ease-out]">
                          
                          {/* Card information header */}
                          <div className="flex justify-between items-start gap-4 flex-wrap">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono bg-[#0B0F19] text-white px-2.5 py-1 rounded-lg uppercase tracking-wider font-bold">
                                  {b.serviceType}
                                </span>
                                {b.colorSorting && (
                                  <span className="text-[9px] font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100 font-bold">
                                    {b.colorSorting}
                                  </span>
                                )}
                                {b.fabricSorting && (
                                  <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200 font-bold">
                                    {b.fabricSorting}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-600 font-sans font-semibold">
                                Stored: <span className="text-slate-900 font-bold">{b.clothingType || 'Dry Clothes'}</span> • Instructions: <span className="text-slate-900 font-mono font-bold bg-[#FAFBFD] px-1.5 py-0.5 rounded-md border border-slate-100">{b.careInstructions || 'Normal Cycle'}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono font-semibold">
                                <span>Weight: {b.weightLbs} Kg</span>
                                <span> | Ordered: {new Date(b.createdAt || '').toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-blue-600 font-mono block">৳{b.priceTotal} BDT</span>
                              <span className="text-[9px] text-emerald-600 font-mono bg-emerald-50 border border-emerald-100 rounded-md px-2.5 py-0.5 inline-block uppercase font-extrabold mt-1.5">
                                {b.status}
                              </span>
                            </div>
                          </div>

                          {/* Notes rendering */}
                          {b.notes && (
                            <div className="text-[11px] text-slate-600 bg-slate-50 border-l-2 border-slate-300 px-3.5 py-2 rounded-e-xl leading-relaxed">
                              "{b.notes}"
                            </div>
                          )}

                          {/* Schedule pick & drop */}
                          <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-500 bg-[#FAFBFD] p-2.5 rounded-xl border border-slate-50">
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Scheduled Collection:</span>
                              <span className="font-extrabold text-[#1E293B]">{b.pickupTime ? new Date(b.pickupTime).toLocaleString() : 'Pending appointment'}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Scheduled Handover:</span>
                              <span className="font-extrabold text-[#1E293B]">{b.deliveryTime ? new Date(b.deliveryTime).toLocaleString() : 'Standard 24hr'}</span>
                            </div>
                          </div>

                          {/* Rendering core visual progress steps milestones */}
                          {renderLaundrySteps(b.status)}

                          {/* Manual simulation triggers to demonstrate transition nodes easily for RUET test audit */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
                            <span className="text-[9px] font-mono text-slate-450 uppercase font-bold">Simulator Controls:</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {b.status === 'Pickup Scheduled' && (
                                <button
                                  onClick={() => updateLaundryStatusInApp(b.id!, 'Picked Up')}
                                  className="text-[9px] font-sans font-bold bg-[#0B0F19] hover:bg-[#1E293B] text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                                >
                                  Complete Pickup →
                                </button>
                              )}
                              {b.status === 'Picked Up' && (
                                <button
                                  onClick={() => updateLaundryStatusInApp(b.id!, 'Washing')}
                                  className="text-[9px] font-sans font-bold bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                                >
                                  Start Washing →
                                </button>
                              )}
                              {b.status === 'Washing' && (
                                <button
                                  onClick={() => updateLaundryStatusInApp(b.id!, 'Ironing')}
                                  className="text-[9px] font-sans font-bold bg-pink-500 hover:bg-pink-400 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                                >
                                  Start Ironing →
                                </button>
                              )}
                              {b.status === 'Ironing' && (
                                <button
                                  onClick={() => updateLaundryStatusInApp(b.id!, 'Out for Delivery')}
                                  className="text-[9px] font-sans font-bold bg-amber-500 hover:bg-amber-400 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                                >
                                  Dispatch to Hostel →
                                </button>
                              )}
                              {b.status === 'Out for Delivery' && (
                                <button
                                  onClick={() => updateLaundryStatusInApp(b.id!, 'Delivered')}
                                  className="text-[9px] font-sans font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer animate-pulse"
                                >
                                  Complete Handover ✓
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  if (confirm("Cancel laundry service list?")) {
                                    try {
                                      await deleteDoc(doc(db, 'laundryBookings', b.id!));
                                      fetchStudentData(currentUser.uid);
                                    } catch (err) { console.error(err); }
                                  }
                                }}
                                className="text-[9px] font-sans font-bold hover:bg-ref-50 text-slate-450 hover:text-red-650 border border-transparent px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                              >
                                Cancel Order
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Important Notice */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-slate-700">
                    <h5 className="font-bold text-slate-900 font-sans">RUET Hostel Campus Collection Rules</h5>
                    <p className="leading-relaxed text-slate-600">
                      Standard pickup schedules map to main dormitory entrance coordinates at Shahid Shahidul Islam Hall, Selim Hall, and Girls Hostel towers. White garments are sorted automatically to prevent pigment transfer. For urgent turnarounds, please activate Express schedules.
                    </p>
                  </div>
                </div>

              </div>
              
            </div>
          </div>
        )}

        </div>

        {/* 4. ACADEMIC SOLID FOOTER */}
        <footer className="bg-white border-t border-stone-200 py-6 text-center text-[10px] text-stone-400 font-mono select-none shrink-0 px-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>© 2026 uni campus — Academic Logistics. All rights reserved.</p>
            <p className="text-[9px]">Live Firestore Synchronization & Gemini Generative Counselors.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
