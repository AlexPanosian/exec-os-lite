-- Create meals table for tracking user meal entries
CREATE TABLE IF NOT EXISTS public.meals (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to auth.users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Meal data
  raw_text TEXT NOT NULL,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,

  -- Add check constraints for non-negative values
  CONSTRAINT calories_non_negative CHECK (calories IS NULL OR calories >= 0),
  CONSTRAINT protein_non_negative CHECK (protein IS NULL OR protein >= 0),
  CONSTRAINT carbs_non_negative CHECK (carbs IS NULL OR carbs >= 0),
  CONSTRAINT fat_non_negative CHECK (fat IS NULL OR fat >= 0)
);

-- Create index on user_id for faster queries
CREATE INDEX idx_meals_user_id ON public.meals(user_id);

-- Create index on created_at for chronological queries
CREATE INDEX idx_meals_created_at ON public.meals(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own meals
CREATE POLICY "Users can view own meals"
  ON public.meals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own meals
CREATE POLICY "Users can insert own meals"
  ON public.meals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own meals
CREATE POLICY "Users can update own meals"
  ON public.meals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own meals
CREATE POLICY "Users can delete own meals"
  ON public.meals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE public.meals IS 'Stores user meal entries with nutritional information';
COMMENT ON COLUMN public.meals.id IS 'Unique identifier for the meal entry';
COMMENT ON COLUMN public.meals.user_id IS 'Reference to the user who created this meal entry';
COMMENT ON COLUMN public.meals.created_at IS 'Timestamp when the meal was logged';
COMMENT ON COLUMN public.meals.raw_text IS 'Freeform text description of the meal';
COMMENT ON COLUMN public.meals.calories IS 'Total calories in the meal (optional)';
COMMENT ON COLUMN public.meals.protein IS 'Grams of protein in the meal (optional)';
COMMENT ON COLUMN public.meals.carbs IS 'Grams of carbohydrates in the meal (optional)';
COMMENT ON COLUMN public.meals.fat IS 'Grams of fat in the meal (optional)';