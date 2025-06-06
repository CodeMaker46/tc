export interface Route {
  id: string;
  name: string;
  distance: number;
  duration: number;
  cost: number;
  tolls: TollPoint[];
  coordinates: [number, number][];
  type: 'cheapest' | 'fastest' | 'balanced';
}

export interface TollPoint {
  id: string;
  name: string;
  location: [number, number];
  cost: number;
  vehicleType: 'car' | 'truck' | 'motorcycle';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  savedRoutes: Route[];
  preferences: {
    vehicleType: 'car' | 'truck' | 'motorcycle';
    preferredRouteType: 'cheapest' | 'fastest' | 'balanced';
  };
}

export interface Query {
  id: string;
  type: 'dispute' | 'add_toll' | 'general';
  title: string;
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: Date;
  location?: [number, number];
}