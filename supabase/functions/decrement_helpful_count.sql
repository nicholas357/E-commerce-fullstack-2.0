CREATE OR REPLACE FUNCTION decrement_helpful_count(review_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE product_reviews
  SET helpful_count = GREATEST(0, helpful_count - 1)
  WHERE id = review_id_param;
END;
$$ LANGUAGE plpgsql;
