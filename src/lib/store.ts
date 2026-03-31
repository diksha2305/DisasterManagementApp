import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Need, Volunteer, User, ResourceInventory, TaskAssignment, Announcement, RiskZone, Scenario, NGO } from './types';

interface AppState {
  currentUser: User | null;
  users: User[];
  needs: Need[];
  volunteers: Volunteer[];
  ngos: NGO[];
  inventory: ResourceInventory[];
  tasks: TaskAssignment[];
  announcements: Announcement[];
  riskZones: RiskZone[];
  scenarios: Scenario[];
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setScenarios: (scenarios: Scenario[]) => void;
  addNeed: (need: Need) => void;
  updateNeed: (id: string, updates: Partial<Need>) => void;
  addAnnouncement: (announcement: Announcement) => void;
  updateVolunteerStatus: (id: string, status: Partial<Volunteer>) => void;
  assignTask: (task: TaskAssignment) => void;
  updateTask: (id: string, updates: Partial<TaskAssignment>) => void;
  
  // Mocks
  installMockData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      needs: [],
      volunteers: [],
      ngos: [],
      inventory: [],
      tasks: [],
      announcements: [],
      riskZones: [],
      scenarios: [],

      setCurrentUser: (user) => set({ currentUser: user }),
      setScenarios: (scenarios) => set({ scenarios }),
      
      addNeed: (need) => set((state) => {
        // Broadcast across tabs (Mocking Supabase Realtime)
        if (typeof window !== 'undefined') {
          const channel = new BroadcastChannel('disaster_relief_channel');
          channel.postMessage({ type: 'ADD_NEED', payload: need });
        }
        return { needs: [...state.needs, need] };
      }),
      
      updateNeed: (id, updates) => set((state) => {
        const newNeeds = state.needs.map(n => n.id === id ? { ...n, ...updates } : n);
        if (typeof window !== 'undefined') {
          const channel = new BroadcastChannel('disaster_relief_channel');
          channel.postMessage({ type: 'UPDATE_NEED', payload: { id, updates } });
        }
        return { needs: newNeeds };
      }),
      
      addAnnouncement: (announcement) => set((state) => {
        if (typeof window !== 'undefined') {
          const channel = new BroadcastChannel('disaster_relief_channel');
          channel.postMessage({ type: 'ADD_ANNOUNCEMENT', payload: announcement });
        }
        return { announcements: [announcement, ...state.announcements] };
      }),

      updateVolunteerStatus: (id, updates) => set((state) => {
        const updatedVolunteers = state.volunteers.map(v => v.id === id ? { ...v, ...updates } : v);
        if (typeof window !== 'undefined') {
          const channel = new BroadcastChannel('disaster_relief_channel');
          channel.postMessage({ type: 'UPDATE_VOLUNTEER', payload: { id, updates } });
        }
        return { volunteers: updatedVolunteers };
      }),

      assignTask: (task) => set((state) => {
        if (typeof window !== 'undefined') {
           const channel = new BroadcastChannel('disaster_relief_channel');
           channel.postMessage({ type: 'ADD_TASK', payload: task });
        }
        return { tasks: [...state.tasks, task] };
      }),

      updateTask: (id, updates) => set((state) => {
        const newTasks = state.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
        if (typeof window !== 'undefined') {
           const channel = new BroadcastChannel('disaster_relief_channel');
           channel.postMessage({ type: 'UPDATE_TASK', payload: { id, updates } });
        }
        return { tasks: newTasks };
      }),
      
      installMockData: () => {
        set((state) => {
          if (state.users.length > 0) return state; // Already installed
          
          return {
            users: require('./mock-data').MOCK_USERS,
            volunteers: require('./mock-data').MOCK_VOLUNTEERS,
            ngos: require('./mock-data').MOCK_NGOS,
            inventory: require('./mock-data').MOCK_INVENTORY,
            riskZones: require('./mock-data').MOCK_RISK_ZONES,
            scenarios: require('./mock-data').MOCK_SCENARIOS,
            needs: [],
            tasks: [],
            announcements: []
          };
        });
      }
    }),
    {
      name: 'disaster-relief-storage', // local storage key
    }
  )
);

// We attach a listener to handle cross-tab synchronization of actions.
if (typeof window !== 'undefined') {
  const channel = new BroadcastChannel('disaster_relief_channel');
  channel.onmessage = (event) => {
    const { type, payload } = event.data;
    const store = useAppStore.getState();
    
    // We update local state based on broadcast messages, avoiding infinite loops 
    // because set() inside the onmessage doesn't broadcast again.
    switch (type) {
      case 'ADD_NEED':
        if (!store.needs.find(n => n.id === payload.id)) {
          useAppStore.setState({ needs: [...store.needs, payload] });
        }
        break;
      case 'UPDATE_NEED':
        useAppStore.setState({
          needs: store.needs.map(n => n.id === payload.id ? { ...n, ...payload.updates } : n)
        });
        break;
      case 'ADD_ANNOUNCEMENT':
        if (!store.announcements.find(a => a.id === payload.id)) {
          useAppStore.setState({ announcements: [payload, ...store.announcements] });
        }
        break;
      case 'UPDATE_VOLUNTEER':
        useAppStore.setState({
          volunteers: store.volunteers.map(v => v.id === payload.id ? { ...v, ...payload.updates } : v)
        });
        break;
      case 'ADD_TASK':
        if (!store.tasks.find(t => t.id === payload.id)) {
           useAppStore.setState({ tasks: [...store.tasks, payload] });
        }
        break;
      case 'UPDATE_TASK':
        useAppStore.setState({
          tasks: store.tasks.map(t => t.id === payload.id ? { ...t, ...payload.updates } : t)
        });
        break;
    }
  };
}
