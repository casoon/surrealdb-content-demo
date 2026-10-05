-- Articles by authors followed by the people Anna follows (two hops).
-- Note: the embedded engine (3.0.2) silently ignores ORDER BY when the path is the FROM source.
SELECT title, <-wrote<-person.name AS authors
FROM person:anna->follows->person->follows->person->wrote->article;
