CREATE OR REPLACE FUNCTION create_gift_cards_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'gift_cards'
  ) THEN
    -- Create the gift_cards table
    CREATE TABLE public.gift_cards (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      image TEXT,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      denominations NUMERIC[] DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add RLS policies
    ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Allow public read access" 
      ON public.gift_cards 
      FOR SELECT 
      USING (true);

    CREATE POLICY "Allow authenticated users to insert" 
      ON public.gift_cards 
      FOR INSERT 
      TO authenticated 
      WITH CHECK (true);

    CREATE POLICY "Allow authenticated users to update their own records" 
      ON public.gift_cards 
      FOR UPDATE 
      TO authenticated 
      USING (true);

    CREATE POLICY "Allow authenticated users to delete their own records" 
      ON public.gift_cards 
      FOR DELETE 
      TO authenticated 
      USING (true);

    -- Create update trigger for updated_at
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.gift_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

    -- Create storage bucket for gift card images if it doesn't exist
    BEGIN
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('gift-card-images', 'gift-card-images', true);
    EXCEPTION
      WHEN unique_violation THEN
        -- Bucket already exists, do nothing
    END;

    -- Set up storage policies
    BEGIN
      -- Allow public read access to the bucket
      INSERT INTO storage.policies (name, bucket_id, operation, definition)
      VALUES ('Public Read Access', 'gift-card-images', 'SELECT', '{"bucket_id":"gift-card-images"}');
      
      -- Allow authenticated users to upload files
      INSERT INTO storage.policies (name, bucket_id, operation, definition)
      VALUES ('Authenticated Upload', 'gift-card-images', 'INSERT', '{"bucket_id":"gift-card-images","auth.role":"authenticated"}');
      
      -- Allow authenticated users to update their own files
      INSERT INTO storage.policies (name, bucket_id, operation, definition)
      VALUES ('Authenticated Update', 'gift-card-images', 'UPDATE', '{"bucket_id":"gift-card-images","auth.role":"authenticated"}');
      
      -- Allow authenticated users to delete their own files
      INSERT INTO storage.policies (name, bucket_id, operation, definition)
      VALUES ('Authenticated Delete', 'gift-card-images', 'DELETE', '{"bucket_id":"gift-card-images","auth.role":"authenticated"}');
    EXCEPTION
      WHEN unique_violation THEN
        -- Policies already exist, do nothing
    END;
  END IF;
END;
$$;
