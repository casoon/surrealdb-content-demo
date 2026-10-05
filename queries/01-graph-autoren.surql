-- Who wrote what? Edges are traversed in both directions.
SELECT
    title,
    <-wrote<-person.name AS authors,
    ->tagged->tag.label AS tags
FROM article
WHERE metadata.level = "einsteiger"
ORDER BY title
LIMIT 4;
