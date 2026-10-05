-- People and tags: fixed structure
DEFINE TABLE person SCHEMAFULL;
DEFINE FIELD name ON person TYPE string;
DEFINE FIELD role ON person TYPE string;

DEFINE TABLE tag SCHEMAFULL;
DEFINE FIELD label ON tag TYPE string;

-- Articles: fixed core fields, metadata stays a free-form document
DEFINE TABLE article SCHEMAFULL;
DEFINE FIELD title     ON article TYPE string;
DEFINE FIELD summary   ON article TYPE string;
DEFINE FIELD content   ON article TYPE string;
DEFINE FIELD published ON article TYPE bool DEFAULT true;
DEFINE FIELD metadata  ON article TYPE object FLEXIBLE;
DEFINE FIELD embedding ON article TYPE array<float, 384>;

-- Relations are tables of their own with a fixed direction
DEFINE TABLE wrote      TYPE RELATION FROM person TO article;
DEFINE TABLE tagged     TYPE RELATION FROM article TO tag;
DEFINE TABLE related_to TYPE RELATION FROM tag TO tag;
DEFINE TABLE follows    TYPE RELATION FROM person TO person;
DEFINE TABLE commented  TYPE RELATION FROM person TO article SCHEMAFULL;
DEFINE FIELD text   ON commented TYPE string;
DEFINE FIELD rating ON commented TYPE int ASSERT $value >= 1 AND $value <= 5;
DEFINE FIELD at     ON commented TYPE datetime DEFAULT time::now();

-- Full text: German stemmer (the sample data is German), BM25 ranking
DEFINE ANALYZER german TOKENIZERS class FILTERS lowercase, ascii, snowball(german);
DEFINE INDEX article_title   ON article FIELDS title   FULLTEXT ANALYZER german BM25 HIGHLIGHTS;
DEFINE INDEX article_content ON article FIELDS content FULLTEXT ANALYZER german BM25 HIGHLIGHTS;

-- Vector search: HNSW index over the embeddings
DEFINE INDEX article_embedding ON article FIELDS embedding HNSW DIMENSION 384 DIST COSINE;
