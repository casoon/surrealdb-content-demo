-- Full-text search with a German stemmer: "Datenbanken" also matches "Datenbank".
SELECT
    title,
    search::highlight("**", "**", 1) AS snippet,
    search::score(1) AS score
FROM article
WHERE content @1@ "Datenbanken"
ORDER BY score DESC
LIMIT 3;
