# Supabase Database Migrations

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `001_create_meals_table.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

4. Apply migrations:
   ```bash
   supabase db push
   ```

### Option 3: Direct Database Connection

If you have direct database access, you can run:
```bash
psql <your-connection-string> -f supabase/migrations/001_create_meals_table.sql
```

## Migration Files

### 001_create_meals_table.sql
Creates the `meals` table with the following features:
- UUID primary key with auto-generation
- Foreign key to auth.users with cascade delete
- Timestamp tracking
- Nutritional data fields (calories, protein, carbs, fat)
- Non-negative constraints on nutritional values
- Row Level Security (RLS) policies for user isolation
- Indexes for performance optimization

## Verifying the Migration

After applying the migration, verify it worked by running this query in the SQL editor:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'meals'
);

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'meals'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'meals';
```

## Rollback Instructions

If you need to rollback this migration:

```sql
-- Drop RLS policies
DROP POLICY IF EXISTS "Users can view own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can insert own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can update own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON public.meals;

-- Drop indexes
DROP INDEX IF EXISTS idx_meals_user_id;
DROP INDEX IF EXISTS idx_meals_created_at;

-- Drop table
DROP TABLE IF EXISTS public.meals;
```

## Type Generation

To generate TypeScript types from your database schema:

```bash
npx supabase gen types typescript --project-ref <your-project-ref> > src/types/database.generated.ts
```

This will create a complete type definition based on your actual database schema.