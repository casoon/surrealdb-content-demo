-- Artikel zu "Datenbanken" inklusive aller Tags, die darauf verweisen.
LET $tags = array::union([tag:datenbanken], tag:datenbanken<-related_to<-tag);

SELECT
    title,
    ->tagged->tag.label AS tags
FROM article
WHERE ->tagged->tag ANYINSIDE $tags
ORDER BY title;
