-- Create gift_cards table
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  denominations JSONB NOT NULL DEFAULT '[]'::JSONB,
  redemption_instructions TEXT,
  validity_days INTEGER NOT NULL DEFAULT 365,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS gift_cards_slug_idx ON gift_cards (slug);

-- Create storage bucket for gift card images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gift-card-images', 'gift-card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for gift card images
-- Allow public read access
CREATE POLICY "Gift Card Images Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'gift-card-images');

-- Allow authenticated users to upload
CREATE POLICY "Gift Card Images Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gift-card-images');

-- Allow authenticated users to update/delete their own uploads
CREATE POLICY "Gift Card Images Owner Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gift-card-images' AND auth.uid() = owner);

CREATE POLICY "Gift Card Images Owner Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gift-card-images' AND auth.uid() = owner);
