-- Wer hat was geschrieben? Die Kante wird in beide Richtungen gelesen.
SELECT
    title,
    <-wrote<-person.name AS authors,
    ->tagged->tag.label AS tags
FROM article
WHERE metadata.level = "einsteiger"
ORDER BY title
LIMIT 4;
