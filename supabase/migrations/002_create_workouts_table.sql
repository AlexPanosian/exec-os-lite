-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('push', 'pull', 'cardio')),
  completed BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON public.workouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_created ON public.workouts(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own workouts
CREATE POLICY "Users can view own workouts"
  ON public.workouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own workouts
CREATE POLICY "Users can create own workouts"
  ON public.workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own workouts
CREATE POLICY "Users can update own workouts"
  ON public.workouts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own workouts
CREATE POLICY "Users can delete own workouts"
  ON public.workouts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.workouts TO authenticated;
GRANT ALL ON public.workouts TO service_role;

-- Add comment
COMMENT ON TABLE public.workouts IS 'Stores user workout history and completion status';