-- Articles tagged "Datenbanken", including all tags related to it.
LET $tags = array::union([tag:datenbanken], tag:datenbanken<-related_to<-tag);

SELECT
    title,
    ->tagged->tag.label AS tags
FROM article
WHERE ->tagged->tag ANYINSIDE $tags
ORDER BY title;
