import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";

export interface Property {
  id: string;
  title: string;
  titleAr?: string;
  price: number;
  currency: "USD" | "IQD";
  priceIQD?: number;
  type: "sale" | "rent";
  propertyType: string;
  city: string;
  district: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  images: string[];
  terraScore: number;
  aiValuation: number;
  aiConfidence: "high" | "medium" | "low";
  verified: boolean;
  agentName: string;
  agentVerified: boolean;
  description: string;
  features: string[];
  views: number;
  leads: number;
  createdAt: string;
  status: "active" | "pending" | "sold";
}

export interface Offer {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  buyerPlan: "free" | "pro" | "elite";
  offerPrice: number;
  currency: "USD" | "IQD";
  askingPrice: number;
  offerType: "BUY" | "RENT";
  financingType: "CASH" | "MORTGAGE";
  closingTimeline: number;
  depositPercent?: number;
  proofUploaded: boolean;
  message?: string;
  seriousnessScore: number;
  status: "SUBMITTED" | "VIEWED" | "ACCEPTED" | "REJECTED" | "COUNTERED" | "EXPIRED" | "WITHDRAWN";
  createdAt: string;
  sellerNote?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyTitle: string;
  stage: "new" | "contacted" | "qualified" | "closed" | "lost";
  source: string;
  notes: string;
  createdAt: string;
}

export interface CRMContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "buyer" | "seller" | "investor";
  lastContact: string;
  notes: string;
  totalDeals: number;
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Luxury Villa with Pool",
    price: 320000,
    currency: "USD",
    priceIQD: 419200000,
    type: "sale",
    propertyType: "Villa",
    city: "Erbil",
    district: "Dream City",
    bedrooms: 5,
    bathrooms: 4,
    area: 450,
    image: property1,
    images: [property1, property2],
    terraScore: 87,
    aiValuation: 335000,
    aiConfidence: "high",
    verified: true,
    agentName: "Ahmed Al-Kurdi",
    agentVerified: true,
    description: "Stunning modern villa in Dream City featuring premium finishes, private pool, landscaped gardens, and panoramic city views.",
    features: ["Swimming Pool", "Garden", "Smart Home", "Security System", "Garage"],
    views: 1247,
    leads: 23,
    createdAt: "2025-12-01",
    status: "active",
  },
  {
    id: "2",
    title: "Modern Apartment - City Center",
    price: 185000,
    currency: "USD",
    priceIQD: 242350000,
    type: "sale",
    propertyType: "Apartment",
    city: "Baghdad",
    district: "Mansour",
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    image: property2,
    images: [property2, property3],
    terraScore: 72,
    aiValuation: 190000,
    aiConfidence: "medium",
    verified: true,
    agentName: "Sara Hassan",
    agentVerified: true,
    description: "Premium apartment in the heart of Mansour with high-end finishes and city views.",
    features: ["Balcony", "Parking", "Gym Access", "24/7 Security"],
    views: 892,
    leads: 15,
    createdAt: "2025-11-15",
    status: "active",
  },
  {
    id: "3",
    title: "Commercial Tower Office",
    price: 450000,
    currency: "USD",
    priceIQD: 589500000,
    type: "sale",
    propertyType: "Commercial",
    city: "Basra",
    district: "Corniche",
    bedrooms: 0,
    bathrooms: 3,
    area: 320,
    image: property3,
    images: [property3],
    terraScore: 64,
    aiValuation: 430000,
    aiConfidence: "medium",
    verified: false,
    agentName: "Omar Trading Co.",
    agentVerified: false,
    description: "Prime commercial office space in Basra's Corniche district with stunning waterfront views.",
    features: ["Elevator", "Conference Room", "Fiber Internet", "Parking"],
    views: 534,
    leads: 8,
    createdAt: "2025-10-20",
    status: "active",
  },
  {
    id: "4",
    title: "Penthouse - Panoramic Views",
    price: 275000,
    currency: "USD",
    priceIQD: 360250000,
    type: "sale",
    propertyType: "Penthouse",
    city: "Sulaymaniyah",
    district: "Salim Street",
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    image: property4,
    images: [property4, property1],
    terraScore: 91,
    aiValuation: 290000,
    aiConfidence: "high",
    verified: true,
    agentName: "Dara Group",
    agentVerified: true,
    description: "Exquisite penthouse with wraparound terrace and unobstructed mountain views.",
    features: ["Terrace", "Smart Home", "Premium Finishes", "Private Elevator"],
    views: 2103,
    leads: 41,
    createdAt: "2025-09-10",
    status: "active",
  },
];

export const mockOffers: Offer[] = [
  {
    id: "OFF-1023",
    propertyId: "1",
    propertyTitle: "Luxury Villa with Pool",
    buyerName: "Karwan Mohammed",
    buyerPlan: "elite",
    offerPrice: 310000,
    currency: "USD",
    askingPrice: 320000,
    offerType: "BUY",
    financingType: "CASH",
    closingTimeline: 21,
    depositPercent: 10,
    proofUploaded: true,
    message: "Serious buyer, ready to close within 3 weeks. Have full financing ready.",
    seriousnessScore: 92,
    status: "SUBMITTED",
    createdAt: "2026-02-10",
  },
  {
    id: "OFF-1019",
    propertyId: "1",
    propertyTitle: "Luxury Villa with Pool",
    buyerName: "Ali Saeed",
    buyerPlan: "pro",
    offerPrice: 280000,
    currency: "USD",
    askingPrice: 320000,
    offerType: "BUY",
    financingType: "MORTGAGE",
    closingTimeline: 60,
    proofUploaded: false,
    seriousnessScore: 55,
    status: "SUBMITTED",
    createdAt: "2026-02-08",
  },
  {
    id: "OFF-1015",
    propertyId: "2",
    propertyTitle: "Modern Apartment - City Center",
    buyerName: "Fatima Al-Rawi",
    buyerPlan: "elite",
    offerPrice: 180000,
    currency: "USD",
    askingPrice: 185000,
    offerType: "BUY",
    financingType: "CASH",
    closingTimeline: 14,
    depositPercent: 15,
    proofUploaded: true,
    message: "Looking to close ASAP. Very interested.",
    seriousnessScore: 95,
    status: "VIEWED",
    createdAt: "2026-02-05",
  },
  {
    id: "OFF-1010",
    propertyId: "4",
    propertyTitle: "Penthouse - Panoramic Views",
    buyerName: "Hassan Group",
    buyerPlan: "pro",
    offerPrice: 240000,
    currency: "USD",
    askingPrice: 275000,
    offerType: "BUY",
    financingType: "CASH",
    closingTimeline: 45,
    proofUploaded: false,
    seriousnessScore: 40,
    status: "REJECTED",
    sellerNote: "Offer too low",
    createdAt: "2026-01-28",
  },
];

export const mockLeads: Lead[] = [
  { id: "L1", name: "Noor Al-Din", email: "noor@email.com", phone: "+964 770 123 4567", propertyId: "1", propertyTitle: "Luxury Villa with Pool", stage: "new", source: "Website", notes: "Interested in villa, asked about pool dimensions", createdAt: "2026-02-12" },
  { id: "L2", name: "Shwan Karim", email: "shwan@email.com", phone: "+964 750 234 5678", propertyId: "2", propertyTitle: "Modern Apartment", stage: "contacted", source: "Referral", notes: "Called, interested but comparing options", createdAt: "2026-02-10" },
  { id: "L3", name: "Aya Mohammed", email: "aya@email.com", phone: "+964 780 345 6789", propertyId: "4", propertyTitle: "Penthouse", stage: "qualified", source: "TerraOffer", notes: "Ready to make offer, prequalified", createdAt: "2026-02-08" },
  { id: "L4", name: "Jamal Talabani", email: "jamal@email.com", phone: "+964 770 456 7890", propertyId: "1", propertyTitle: "Luxury Villa with Pool", stage: "closed", source: "Website", notes: "Deal closed at $315K", createdAt: "2026-01-20" },
  { id: "L5", name: "Dana Hawrami", email: "dana@email.com", phone: "+964 750 567 8901", propertyId: "3", propertyTitle: "Commercial Tower", stage: "lost", source: "Ad Campaign", notes: "Budget too low, went with competitor", createdAt: "2026-01-15" },
];

export const mockContacts: CRMContact[] = [
  { id: "C1", name: "Karwan Mohammed", email: "karwan@email.com", phone: "+964 770 111 2222", type: "buyer", lastContact: "2026-02-12", notes: "VIP buyer, multiple investments", totalDeals: 3 },
  { id: "C2", name: "Sara Development Co.", email: "info@sara-dev.com", phone: "+964 750 222 3333", type: "seller", lastContact: "2026-02-10", notes: "Developer with 12 active listings", totalDeals: 8 },
  { id: "C3", name: "Gulf Investment Fund", email: "invest@gulf.com", phone: "+964 780 333 4444", type: "investor", lastContact: "2026-02-08", notes: "Looking for 10+ unit blocks", totalDeals: 5 },
];

export const terraScoreBreakdown = {
  location: 22,
  condition: 18,
  market: 15,
  documentation: 20,
  priceAlignment: 12,
};

export const adminStats = {
  totalListings: 2847,
  activeOffers: 342,
  pendingVerifications: 28,
  flaggedListings: 7,
  totalUsers: 14320,
  monthlyRevenue: 48500,
  conversionRate: 3.2,
  avgTerraScore: 71,
};
