-- Semantische Suche: die Frage wird eingebettet und als $query_vec übergeben.
SELECT
    title,
    vector::distance::knn() AS distance
FROM article
WHERE embedding <|3,40|> $query_vec
ORDER BY distance;
