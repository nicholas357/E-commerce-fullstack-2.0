CREATE OR REPLACE FUNCTION get_average_product_rating(product_id_param UUID)
RETURNS FLOAT AS $$
DECLARE
  avg_rating FLOAT;
BEGIN
  SELECT COALESCE(AVG(rating), 0) INTO avg_rating
  FROM product_reviews
  WHERE product_id = product_id_param;
  
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;
