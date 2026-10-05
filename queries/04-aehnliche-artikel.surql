-- Nearest neighbours in vector space: the articles most similar to one article.
LET $vec = article:rag_chunking.embedding;

SELECT title, vector::distance::knn() AS distance
FROM article
WHERE embedding <|4,40|> $vec AND id != article:rag_chunking
ORDER BY distance;
