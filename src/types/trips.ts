export type TripStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'

export interface Trip {
  id: string
  user_id: string
  created_at: string
  destination: string
  country: string
  city: string
  accommodation: string | null
  start_date: string
  end_date: string
  flight_number: string | null
  departure_airport: string | null
  arrival_airport: string | null
  departure_time: string | null
  arrival_time: string | null
  notes: string | null
  status: TripStatus
}

export interface CreateTripInput {
  destination: string
  country: string
  city: string
  accommodation?: string | null
  start_date: string
  end_date: string
  flight_number?: string | null
  departure_airport?: string | null
  arrival_airport?: string | null
  departure_time?: string | null
  arrival_time?: string | null
  notes?: string | null
  status?: TripStatus
}

export interface UpdateTripInput {
  destination?: string
  country?: string
  city?: string
  accommodation?: string | null
  start_date?: string
  end_date?: string
  flight_number?: string | null
  departure_airport?: string | null
  arrival_airport?: string | null
  departure_time?: string | null
  arrival_time?: string | null
  notes?: string | null
  status?: TripStatus
}