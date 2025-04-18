CREATE OR REPLACE FUNCTION increment_helpful_count(review_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE product_reviews
  SET helpful_count = helpful_count + 1
  WHERE id = review_id_param;
END;
$$ LANGUAGE plpgsql;
