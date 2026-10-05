-- Kommentare sind Kanten mit eigenen Feldern: Text, Bewertung, Zeitstempel.
SELECT
    title,
    <-commented.{ from: in.name, rating, text } AS comments,
    math::mean(<-commented.rating) AS avg_rating
FROM article
WHERE count(<-commented) > 0
ORDER BY avg_rating DESC;
