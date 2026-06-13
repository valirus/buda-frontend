import { create } from 'zustand'

interface NodeData {
  id: string;
  text: string;
  bounties?: string[];
  evidence_link?: string; // <-- ADICIÓN CRUCIAL
}

interface User {
  user_id: string;
  username: string;
  wallet_balance?: number;
  cognitive_score?: number;
}

type ActionType = 'SUPPORTS' | 'REFUTES' | 'SYNTHESIZES' | null;

interface GraphState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  fetchUserStats: (userId: string) => Promise<void>; // NUEVA ACCIÓN REACTIVA
  graphData: { nodes: any[]; links: any[] };
  fetchGraphData: () => Promise<void>;
  selectedNode: NodeData | null;
  setSelectedNode: (node: NodeData | null) => void;
  actionType: ActionType;
  setActionType: (type: ActionType) => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  
  // Extrae y actualiza solo las estadísticas del agente sin borrar su sesión
  fetchUserStats: async (userId: string) => {
    try {
      const res = await fetch(`https://buda-backend.onrender.com/usuarios/${userId}/stats`);
      const data = await res.json();
      if (!data.error) {
        set((state) => ({
          currentUser: state.currentUser 
            ? { ...state.currentUser, wallet_balance: data.wallet_balance, cognitive_score: data.cognitive_score } 
            : null
        }));
      }
    } catch (err) {
      console.error("Error obteniendo métricas del agente:", err);
    }
  },
  
  graphData: { nodes: [], links: [] },
  fetchGraphData: async () => {
    try {
      const res = await fetch("https://buda-backend.onrender.com/nodos/mapa");
      const data = await res.json();
      set({ graphData: data });
    } catch (err) {
      console.error("Error en la extracción síncrona del mapa:", err);
    }
  },
  
  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node, actionType: null }),
  actionType: null,
  setActionType: (type) => set({ actionType: type }),
}))