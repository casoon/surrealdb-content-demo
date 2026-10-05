-- Semantische Suche, aber nur Artikel von Leuten, denen Anna folgt.
LET $followed = person:anna->follows->person;

SELECT
    title,
    <-wrote<-person.name AS authors,
    vector::distance::knn() AS distance
FROM article
WHERE embedding <|3,40|> $query_vec
  AND <-wrote<-person ANYINSIDE $followed
ORDER BY distance;
