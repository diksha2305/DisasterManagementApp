import { User, Volunteer, NGO, Need, Scenario, RiskZone, ResourceInventory } from './types';

// Mock Users
export const MOCK_USERS: User[] = [
  { id: 'u1', email: 'govt@relief.gov', phone: '9999999999', role: 'government', name: 'Relief Coordinator', location: { lat: 26.9124, lng: 75.7873 } },
  { id: 'v1', email: 'rajesh@vol.com', phone: '9876543210', role: 'volunteer', name: 'Rajesh Kumar', location: { lat: 26.95, lng: 75.80 } },
  { id: 'v2', email: 'priya@vol.com', phone: '9876543211', role: 'volunteer', name: 'Priya Sharma', location: { lat: 26.92, lng: 75.75 } },
  { id: 'n1', email: 'redcross@ngo.com', phone: '9876543212', role: 'ngo', name: 'Red Cross Rajasthan', location: { lat: 26.88, lng: 75.75 } },
  { id: 'vic1', email: 'victim1@test.com', phone: '9876543213', role: 'victim', name: 'Aarav', location: { lat: 26.90, lng: 75.78 } }
];

export const MOCK_VOLUNTEERS: Volunteer[] = [
  { ...MOCK_USERS[1], skills: ['medical', 'rescue'], availability: 8, languages: ['Hindi', 'English'], vehicle_access: true, vehicle_type: 'Motorcycle', tasks_completed: 47, people_helped: 234, rating: 4.8, online: true },
  { ...MOCK_USERS[2], skills: ['logistics', 'general'], availability: 4, languages: ['Hindi'], vehicle_access: false, tasks_completed: 12, people_helped: 45, rating: 4.5, online: false }
];

export const MOCK_NGOS: NGO[] = [
  { ...MOCK_USERS[3], org_name: 'Red Cross Rajasthan', hq_location: { lat: 26.88, lng: 75.75 }, staff_count: 50 }
];

export const MOCK_INVENTORY: ResourceInventory[] = [
  { id: 'inv1', ngo_id: 'n1', resource_type: 'food', item_name: 'Rice Bags (5kg)', quantity: 500, unit: 'bags', location: { lat: 26.88, lng: 75.75 }, available: true },
  { id: 'inv2', ngo_id: 'n1', resource_type: 'medicine', item_name: 'First Aid Kits', quantity: 200, unit: 'kits', location: { lat: 26.88, lng: 75.75 }, available: true },
  { id: 'inv3', ngo_id: 'n1', resource_type: 'water', item_name: 'Water Pouches (1L)', quantity: 3000, unit: 'pouches', location: { lat: 26.88, lng: 75.75 }, available: true },
  { id: 'inv4', ngo_id: 'n1', resource_type: 'shelter', item_name: 'Emergency Tents', quantity: 80, unit: 'tents', location: { lat: 26.88, lng: 75.75 }, available: false },
  { id: 'inv5', ngo_id: 'n1', resource_type: 'clothing', item_name: 'Blankets', quantity: 650, unit: 'blankets', location: { lat: 26.88, lng: 75.75 }, available: true },
];

export const MOCK_SCENARIOS: Scenario[] = [
  {
    id: "monsoon_jaipur_2025",
    name: "Monsoon Flash Flood - Jaipur",
    description: "Heavy rainfall triggers flash flood in low-lying areas",
    disasterType: "flood",
    severity: "high",
    affectedPeople: 2147,
    location: { lat: 26.9124, lng: 75.7873, radius: 15 },
    weatherCondition: { rainfall: 87, windSpeed: 25, temperature: 28 },
    timeline: [
      { minute: 0, event: "Heavy rainfall begins", requestCount: 0 },
      { minute: 5, event: "Reports of water rising", requestCount: 12 },
      { minute: 15, event: "Evacuation alerts", requestCount: 45 },
      { minute: 30, event: "Water levels peak", requestCount: 87 },
      { minute: 60, event: "Rainfall decreases", requestCount: 124 },
    ],
    requestTemplates: [
      { need: "shelter", people: 8, urgency: "high", location: [26.91, 75.78] },
      { need: "food", people: 15, urgency: "medium", location: [26.92, 75.79] },
      { need: "medical", people: 2, urgency: "critical", location: [26.90, 75.78] }
    ],
    availableResources: {
      volunteers: MOCK_VOLUNTEERS,
      ngos: MOCK_NGOS
    }
  }
];

export const MOCK_RISK_ZONES: RiskZone[] = [
  {
    id: 'rz1',
    region: 'South Jaipur Lowlands',
    risk_score: 75,
    risk_level: 'red',
    polygon: [
      { lat: 26.89, lng: 75.76 },
      { lat: 26.93, lng: 75.76 },
      { lat: 26.93, lng: 75.80 },
      { lat: 26.89, lng: 75.80 }
    ],
    forecast_time: new Date(Date.now() + 3600000 * 24).toISOString() // Tomorrow
  }
];
