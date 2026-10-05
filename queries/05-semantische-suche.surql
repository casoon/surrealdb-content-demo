-- Semantic search: the question is embedded and passed as $query_vec.
SELECT
    title,
    vector::distance::knn() AS distance
FROM article
WHERE embedding <|3,40|> $query_vec
ORDER BY distance;
