-- Create storage bucket for gift card images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gift-card-images', 'gift-card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload gift card images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gift-card-images');

-- Set up storage policy to allow public read access
CREATE POLICY "Allow public to view gift card images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'gift-card-images');

-- Set up storage policy to allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated users to update their own gift card images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'gift-card-images' AND auth.uid() = owner);

-- Set up storage policy to allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated users to delete their own gift card images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'gift-card-images' AND auth.uid() = owner);
