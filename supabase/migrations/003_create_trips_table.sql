-- Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  destination TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  accommodation TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  flight_number TEXT,
  departure_airport TEXT,
  arrival_airport TEXT,
  departure_time TIMESTAMPTZ,
  arrival_time TIMESTAMPTZ,
  notes TEXT,
  status TEXT DEFAULT 'planned' NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_start_date ON public.trips(start_date);
CREATE INDEX IF NOT EXISTS idx_trips_end_date ON public.trips(end_date);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_user_dates ON public.trips(user_id, start_date, end_date);

-- Enable Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own trips
CREATE POLICY "Users can view own trips"
  ON public.trips
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own trips
CREATE POLICY "Users can create own trips"
  ON public.trips
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own trips
CREATE POLICY "Users can update own trips"
  ON public.trips
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own trips
CREATE POLICY "Users can delete own trips"
  ON public.trips
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;

-- Add comment
COMMENT ON TABLE public.trips IS 'Stores user travel information including flights and accommodations';