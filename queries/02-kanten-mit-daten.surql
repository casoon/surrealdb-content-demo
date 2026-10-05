-- Comments are edges with fields of their own: text, rating, timestamp.
SELECT
    title,
    <-commented.{ from: in.name, rating, text } AS comments,
    math::mean(<-commented.rating) AS avg_rating
FROM article
WHERE count(<-commented) > 0
ORDER BY avg_rating DESC;
