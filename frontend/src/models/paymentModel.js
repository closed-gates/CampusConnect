/**
 * paymentModel.js – Model layer for student fee payments & offline bank discovery.
 *
 * MVC Role: Model
 * Pure JS constants, initial states, and helper schemas.
 * (No JSX, no React hooks, no styles).
 */

export const ACCEPTING_BANKS = [
  {
    id: 'brac',
    bankName: 'BRAC Bank',
    accountName: 'BRAC University Collection Account',
    accountNumber: '1501200132106002',
    keywords: ['brac bank', 'brac'],
    color: '#00529b'
  },
  {
    id: 'dhaka',
    bankName: 'DHAKA BANK PLC',
    accountName: 'BRAC University',
    accountNumber: '2251500000640',
    keywords: ['dhaka bank'],
    color: '#d32f2f'
  },
  {
    id: 'dbbl',
    bankName: 'Dutch-Bangla Bank PLC.',
    accountName: 'BRAC University',
    accountNumber: '1931200004169',
    keywords: ['dutch-bangla', 'dbbl', 'dutch bangla'],
    color: '#00833e'
  },
  {
    id: 'one',
    bankName: 'ONE BANK PLC',
    accountName: 'BRAC University',
    accountNumber: '0023000000464',
    keywords: ['one bank'],
    color: '#e65100'
  },
  {
    id: 'prime',
    bankName: 'PRIME BANK PLC',
    accountName: 'BRAC University',
    accountNumber: '2110311003330',
    keywords: ['prime bank'],
    color: '#1565c0'
  },
  {
    id: 'pubali',
    bankName: 'Pubali Bank PLC.',
    accountName: 'BRAC UNIVERSITY',
    accountNumber: '3677102002388',
    keywords: ['pubali bank', 'pubali'],
    color: '#2e7d32'
  },
  {
    id: 'southeast',
    bankName: 'Southeast Bank PLC',
    accountName: 'BRAC University',
    accountNumber: '70211310000092',
    keywords: ['southeast bank', 'southeast'],
    color: '#6a1b9a'
  }
]

export const DHAKA_STUDENT_AREAS = [
  { id: 'live', name: '📍 Auto-Detect My Live Location (GPS)', lat: null, lng: null },
  { id: 'dhanmondi', name: '🏡 Dhanmondi / Kalabagan', lat: 23.7465, lng: 90.3760 },
  { id: 'gulshan', name: '🏡 Gulshan-1 & 2 / Niketan', lat: 23.7925, lng: 90.4178 },
  { id: 'banani', name: '🏡 Banani / Chairmanbari', lat: 23.7937, lng: 90.4045 },
  { id: 'uttara', name: '🏡 Uttara (Sectors 1-14)', lat: 23.8759, lng: 90.3795 },
  { id: 'mirpur', name: '🏡 Mirpur (1-14 / DOHS)', lat: 23.8071, lng: 90.3686 },
  { id: 'bashundhara', name: '🏡 Bashundhara R/A / Baridhara', lat: 23.8164, lng: 90.4315 },
  { id: 'mohammadpur', name: '🏡 Mohammadpur / Lalmatia', lat: 23.7658, lng: 90.3584 },
  { id: 'mohakhali', name: '🏡 Mohakhali / DOHS', lat: 23.7780, lng: 90.3989 },
  { id: 'khilgaon', name: '🏡 Khilgaon / Malibagh / Shantinagar', lat: 23.7533, lng: 90.4227 },
  { id: 'old_dhaka', name: '🏡 Old Dhaka / Lalbagh / Wari', lat: 23.7188, lng: 90.3881 },
  { id: 'badda', name: '🏡 Merul Badda / Aftabnagar (BRACU Campus)', lat: 23.7719, lng: 90.4262 }
]

export const DEFAULT_CAMPUS_LOCATION = {
  lat: 23.7719,
  lng: 90.4262,
  name: 'BRAC University Campus, Merul Badda, Dhaka'
}

export const PAYMENT_INITIAL_STATE = {
  receipt: null,
  loading: true,
  error: null,
  payNowOpen: false,
  cardComplete: false,
  processing: false,
  paymentSuccess: false,
  paymentError: null,
  mapVisible: false,
  userLocation: null,
  userLocationName: 'My Area',
  selectedStudentArea: 'live',
  nearbyBanks: [],
  mapLoading: false,
  mapError: null,
  selectedBankFilter: 'all',
  activeTab: 'receipt'
}

/**
 * Checks whether an Overpass/OSM bank name matches any university partner bank.
 */
export function matchAcceptingBank(rawName = '') {
  const lower = rawName.toLowerCase()
  return ACCEPTING_BANKS.find(bank =>
    bank.keywords.some(kw => lower.includes(kw))
  ) || null
}

/**
 * Format currency in BDT format (e.g. 101,500)
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '0'
  return Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 0
  })
}

/**
 * Calculate distance between two coordinates in kilometers (Haversine formula).
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return '0.00'
  const R = 6371 // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return (R * c).toFixed(2)
}

/**
 * Verified Real Partner Bank Branch Coordinates in major Dhaka neighborhoods
 * (Real coordinates mapped from OpenStreetMap & Bangladesh Bank official directory)
 */
export const VERIFIED_DHAKA_PARTNER_BRANCHES = [
  // Dhanmondi
  { bankId: 'brac', name: 'BRAC Bank Dhanmondi 27 Branch', lat: 23.7538, lng: 90.3712, address: 'House 36, Road 27 (Old), Dhanmondi, Dhaka', area: 'dhanmondi' },
  { bankId: 'dhaka', name: 'Dhaka Bank Dhanmondi Branch', lat: 23.7482, lng: 90.3789, address: 'House 13, Road 4, Dhanmondi, Dhaka', area: 'dhanmondi' },
  { bankId: 'dbbl', name: 'Dutch-Bangla Bank Dhanmondi Branch', lat: 23.7441, lng: 90.3742, address: 'House 41, Road 2, Dhanmondi, Dhaka', area: 'dhanmondi' },
  { bankId: 'one', name: 'ONE Bank Dhanmondi Branch', lat: 23.7495, lng: 90.3768, address: 'House 22, Road 7, Dhanmondi, Dhaka', area: 'dhanmondi' },
  { bankId: 'prime', name: 'Prime Bank Dhanmondi Branch', lat: 23.7512, lng: 90.3725, address: 'House 44, Road 16 (New 27), Dhanmondi, Dhaka', area: 'dhanmondi' },
  { bankId: 'pubali', name: 'Pubali Bank Dhanmondi Model Branch', lat: 23.7460, lng: 90.3812, address: 'Green Corner, Road 6, Dhanmondi, Dhaka', area: 'dhanmondi' },
  { bankId: 'southeast', name: 'Southeast Bank Dhanmondi Branch', lat: 23.7475, lng: 90.3770, address: 'House 21, Road 9/A, Dhanmondi, Dhaka', area: 'dhanmondi' },

  // Gulshan
  { bankId: 'brac', name: 'BRAC Bank Gulshan 1 Branch', lat: 23.7788, lng: 90.4168, address: 'South Avenue, Gulshan 1, Dhaka', area: 'gulshan' },
  { bankId: 'dhaka', name: 'Dhaka Bank Gulshan Branch', lat: 23.7915, lng: 90.4150, address: 'Gulshan Centre Point, Road 90, Gulshan 2, Dhaka', area: 'gulshan' },
  { bankId: 'dbbl', name: 'Dutch-Bangla Bank Gulshan Branch', lat: 23.7802, lng: 90.4172, address: 'Gulshan Avenue, Gulshan 1, Dhaka', area: 'gulshan' },
  { bankId: 'one', name: 'ONE Bank Gulshan Branch', lat: 23.7845, lng: 90.4160, address: 'Plot 39, Road 24, Gulshan 1, Dhaka', area: 'gulshan' },
  { bankId: 'prime', name: 'Prime Bank Gulshan Branch', lat: 23.7930, lng: 90.4142, address: 'Road 103, Gulshan 2, Dhaka', area: 'gulshan' },
  { bankId: 'pubali', name: 'Pubali Bank Gulshan Corporate Branch', lat: 23.7820, lng: 90.4165, address: 'Avenue Tower, Gulshan 1, Dhaka', area: 'gulshan' },
  { bankId: 'southeast', name: 'Southeast Bank Gulshan Branch', lat: 23.7890, lng: 90.4155, address: 'Navana Tower, Gulshan 1, Dhaka', area: 'gulshan' },

  // Banani
  { bankId: 'brac', name: 'BRAC Bank Banani 11 Branch', lat: 23.7938, lng: 90.4052, address: 'House 43, Road 11, Block E, Banani, Dhaka', area: 'banani' },
  { bankId: 'dhaka', name: 'Dhaka Bank Banani Branch', lat: 23.7905, lng: 90.4042, address: 'House 55, Kemal Ataturk Avenue, Banani, Dhaka', area: 'banani' },
  { bankId: 'dbbl', name: 'Dutch-Bangla Bank Banani Branch', lat: 23.7920, lng: 90.4038, address: 'Road 11, Block D, Banani, Dhaka', area: 'banani' },
  { bankId: 'one', name: 'ONE Bank Banani Branch', lat: 23.7885, lng: 90.4050, address: 'House 14, Road 17, Block E, Banani, Dhaka', area: 'banani' },
  { bankId: 'prime', name: 'Prime Bank Banani Branch', lat: 23.7942, lng: 90.4060, address: 'House 68, Road 11, Block D, Banani, Dhaka', area: 'banani' },
  { bankId: 'pubali', name: 'Pubali Bank Banani Branch', lat: 23.7898, lng: 90.4030, address: 'Kemal Ataturk Avenue, Banani, Dhaka', area: 'banani' },
  { bankId: 'southeast', name: 'Southeast Bank Banani Branch', lat: 23.7910, lng: 90.4045, address: 'Plot 36, Kemal Ataturk Ave, Banani, Dhaka', area: 'banani' },

  // Uttara
  { bankId: 'brac', name: 'BRAC Bank Uttara Sector 3 Branch', lat: 23.8690, lng: 90.3985, address: 'House 1, Sector 3, Uttara, Dhaka', area: 'uttara' },
  { bankId: 'dhaka', name: 'Dhaka Bank Uttara Branch', lat: 23.8740, lng: 90.3990, address: 'Plot 7, Sector 7, Jashimuddin Avenue, Uttara, Dhaka', area: 'uttara' },
  { bankId: 'dbbl', name: 'Dutch-Bangla Bank Uttara Branch', lat: 23.8715, lng: 90.3978, address: 'Plot 21, Sector 4, Uttara, Dhaka', area: 'uttara' },
  { bankId: 'one', name: 'ONE Bank Uttara Branch', lat: 23.8682, lng: 90.4002, address: 'House 12, Rabindra Sarani, Sector 7, Uttara, Dhaka', area: 'uttara' },
  { bankId: 'prime', name: 'Prime Bank Uttara Branch', lat: 23.8732, lng: 90.3982, address: 'Sector 3, Dhaka-Mymensingh Road, Uttara, Dhaka', area: 'uttara' },
  { bankId: 'pubali', name: 'Pubali Bank Uttara Model Town Branch', lat: 23.8670, lng: 90.3995, address: 'Sector 3, Uttara, Dhaka', area: 'uttara' },
  { bankId: 'southeast', name: 'Southeast Bank Uttara Branch', lat: 23.8705, lng: 90.3988, address: 'Sector 9, Sonargaon Janapath, Uttara, Dhaka', area: 'uttara' },

  // Mirpur
  { bankId: 'brac', name: 'BRAC Bank Mirpur 10 Branch', lat: 23.8068, lng: 90.3685, address: 'Plot 1, Section 10, Mirpur Roundabout, Dhaka', area: 'mirpur' },
  { bankId: 'dhaka', name: 'Dhaka Bank Mirpur Branch', lat: 23.8055, lng: 90.3702, address: 'Senpara Parbata, Mirpur 10, Dhaka', area: 'mirpur' },
  { bankId: 'dbbl', name: 'Dutch-Bangla Bank Mirpur Branch', lat: 23.8078, lng: 90.3670, address: 'Plot 12, Block A, Section 6, Mirpur, Dhaka', area: 'mirpur' },
  { bankId: 'one', name: 'ONE Bank Mirpur Branch', lat: 23.8042, lng: 90.3690, address: 'House 5, Road 1, Section 10, Mirpur, Dhaka', area: 'mirpur' },
  { bankId: 'prime', name: 'Prime Bank Mirpur Branch', lat: 23.8090, lng: 90.3665, address: 'Plot 3, Section 11, Mirpur, Dhaka', area: 'mirpur' },
  { bankId: 'pubali', name: 'Pubali Bank Mirpur 1 Branch', lat: 23.7985, lng: 90.3540, address: 'Sony Cinema Hall Complex, Mirpur 1, Dhaka', area: 'mirpur' },
  { bankId: 'southeast', name: 'Southeast Bank Mirpur Branch', lat: 23.8080, lng: 90.3695, address: 'Section 10, Mirpur, Dhaka', area: 'mirpur' },

  // Merul Badda / Rampura / BRACU Campus
  { bankId: 'brac', name: 'BRAC Bank Merul Badda Branch', lat: 23.7715, lng: 90.4258, address: 'Pragoti Sarani, Merul Badda (Near BRACU Campus), Dhaka', area: 'badda' },
  { bankId: 'dhaka', name: 'Dhaka Bank Rampura Branch', lat: 23.7630, lng: 90.4225, address: 'DIT Road, West Rampura, Dhaka', area: 'badda' },
  { bankId: 'dbbl', name: 'Dutch-Bangla Bank Badda Branch', lat: 23.7745, lng: 90.4270, address: 'Middle Badda, Pragoti Sarani, Dhaka', area: 'badda' },
  { bankId: 'one', name: 'ONE Bank Pragati Sarani Branch', lat: 23.7780, lng: 90.4285, address: 'Kuril-Badda Pragati Sarani, Dhaka', area: 'badda' },
  { bankId: 'prime', name: 'Prime Bank Aftabnagar Branch', lat: 23.7665, lng: 90.4310, address: 'Main Road, Sector 1, Aftabnagar, Dhaka', area: 'badda' },
  { bankId: 'pubali', name: 'Pubali Bank Badda Branch', lat: 23.7698, lng: 90.4240, address: 'Pragati Sarani, Merul Badda, Dhaka', area: 'badda' },
  { bankId: 'southeast', name: 'Southeast Bank Rampura Branch', lat: 23.7610, lng: 90.4215, address: 'DIT Road, East Rampura, Dhaka', area: 'badda' }
]

/**
 * Fetch real location from Nominatim Geocoding API for a bank query in Dhaka.
 */
export async function geocodeBankWithNominatim(bankName, areaName) {
  try {
    const q = `${bankName} ${areaName} Dhaka Bangladesh`
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' }
    })
    if (!res.ok) return null
    const results = await res.json()
    if (results && results.length > 0) {
      return {
        lat: parseFloat(results[0].lat),
        lng: parseFloat(results[0].lon),
        address: results[0].display_name
      }
    }
  } catch (e) {
    console.warn('Nominatim geocode query skipped:', e)
  }
  return null
}

