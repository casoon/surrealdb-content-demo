-- Nächste Nachbarn im Vektorraum: die ähnlichsten Artikel zu einem Artikel.
LET $vec = article:rag_chunking.embedding;

SELECT title, vector::distance::knn() AS distance
FROM article
WHERE embedding <|4,40|> $vec AND id != article:rag_chunking
ORDER BY distance;
