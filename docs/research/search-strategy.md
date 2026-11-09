# Search Strategy for Gibiverse MVP

> Research findings for [Choose a search strategy for MVP](https://github.com/Panda-SGH/gibiverse/issues/5)

## Recommendation

**Use PostgreSQL `ILIKE` with `OR` across columns for MVP launch, with a clear upgrade path to PostgreSQL full-text search (`tsvector`/`tsquery`) when search quality or performance demands it.**

Rationale:
- ILIKE is zero-infrastructure, works with the existing Drizzle `ilike()` operator out of the box, needs no extensions or schema changes, and meets the MVP bar ("find a resource by course name, title keywords, or description").
- PostgreSQL full-text search is the natural next step — it's built into Postgres, supported by Drizzle's `sql` template and `customType`, and adds word-boundary matching, stemming, ranking, and GIN-indexed performance. But it's more implementation effort than MVP needs.
- External search services (Meilisearch, Typesense, Elasticsearch) are overkill for MVP and add operational burden.

## Comparison Table

| Criterion | ILIKE | PG Full-Text Search (tsvector) | pg_trgm | External (Meilisearch etc.) |
|---|---|---|---|---|
| **Implementation effort** | ~10 lines of Drizzle | ~40-60 lines + schema changes | ~30 lines + extension | Separate service + sync pipeline |
| **Drizzle support** | Native `ilike()` operator | Via `sql` template + `customType` | Via `sql` template | N/A (HTTP client) |
| **Schema changes** | None | `tsvector` generated column + GIN index | `CREATE EXTENSION` + GIN index | None (external index) |
| **Substring matching** | ✅ `%term%` | ❌ word-boundary only | ✅ trigram similarity | ✅ |
| **Word-boundary search** | ❌ | ✅ | ✅ | ✅ |
| **Stemming** | ❌ | ✅ (language-aware) | ❌ | ✅ |
| **Ranking** | ❌ | ✅ `ts_rank` | ✅ `similarity()` | ✅ |
| **Typo tolerance** | ❌ | ❌ | ✅ fuzzy matching | ✅ |
| **Multi-column search** | Manual `OR` | Single concatenated `tsvector` | Manual `OR` or concat | Native multi-field |
| **Performance at 10K rows** | Fine (seq scan OK) | Excellent (GIN index) | Good (GIN index) | Excellent |
| **Performance at 100K rows** | Slow without index | Excellent (GIN index) | Good (GIN index) | Excellent |
| **ILIKE index support** | `pg_trgm` GIN needed | Built-in GIN on `tsvector` | Built-in GIN | N/A |
| **Upgrade path** | → tsvector or pg_trgm | → external if needed | → external if needed | Already external |

## Approach 1: ILIKE (Recommended for MVP)

### How it works

PostgreSQL `ILIKE` performs case-insensitive pattern matching. With `%term%` it finds any row where the column contains the substring.

### Drizzle ORM support

Drizzle ORM 1.0.0-rc.5 exports `ilike` as a **first-class operator** from `drizzle-orm`:

```typescript
// Source: drizzle-orm/sql/expressions/conditions.d.ts
declare function ilike(
  column: Column | SQL.Aliased | SQL | SQLWrapper,
  value: string | SQLWrapper
): SQL;
```

### Code example

```typescript
import { ilike, or, sql } from "drizzle-orm";
import { resource } from "../db/schema/resource";

// Simple multi-column ILIKE search
function searchResources(db: Database, query: string) {
  const pattern = `%${query}%`;
  
  return db
    .select()
    .from(resource)
    .where(
      or(
        ilike(resource.title, pattern),
        ilike(resource.description, pattern),
        ilike(resource.courseName, pattern), // denormalized or joined
      )
    )
    .limit(20);
}
```

### Limitations

- **No ranking**: Results come back in insertion order (or whatever `ORDER BY` you add), not relevance order.
- **Substring only**: `%data%` matches "database", "metadata", "data" equally — no word-boundary awareness.
- **Performance**: Without an index, `ILIKE '%term%'` triggers a sequential scan. At <10K rows this is fine. At 100K+ rows, consider adding `pg_trgm` GIN indexes.
- **No stemming**: Searching "uploaded" won't match "upload".

### When to upgrade

Upgrade to full-text search when:
1. Users complain about irrelevant results (substring matching is too loose)
2. You need ranked results (most relevant first)
3. Table grows past ~50K rows and search feels slow

## Approach 2: PostgreSQL Full-Text Search (tsvector/tsquery)

### How it works

PostgreSQL's built-in full-text search converts text into `tsvector` (a sorted list of normalized lexemes) and queries into `tsquery` (a boolean query of lexemes). The `@@` operator tests whether a `tsvector` matches a `tsquery`. GIN indexes on `tsvector` columns make this fast.

Key functions:
- `to_tsvector('english', text)` — converts text to a normalized lexeme vector
- `plainto_tsquery('english', text)` — converts a user search string into a tsquery (space = AND)
- `websearch_to_tsquery('english', text)` — like `plainto_tsquery` but supports `"quoted phrases"`, `OR`, and `-exclude` (PG 11+)
- `ts_rank(vector, query)` — scores how well a document matches

### Drizzle ORM support

Drizzle ORM 1.0.0-rc.5 does **not** have a built-in `tsvector` column type or `@@` operator, but provides everything needed:

1. **`sql` template tag**: Express any SQL, including `to_tsvector(...) @@ websearch_to_tsquery(...)`.
2. **`customType`**: Define a `tsvector` column type for schema declarations and migrations.
3. **`generatedAlwaysAs`**: Define generated columns (for auto-maintained `tsvector` columns).
4. **GIN indexes**: `PgIndexMethod` type includes `'gin'` natively — use `index().using('gin', ...)`.
5. **Codec awareness**: The codecs list in `pg-core/codecs.d.ts` includes `'tsvector'` and `'tsquery'` as known PostgreSQL types.

### Code example

```typescript
import { sql, SQL } from "drizzle-orm";
import { customType, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// 1. Define a custom tsvector column type
const tsvectorType = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
  codec() {
    return "tsvector";
  },
});

// 2. Schema with a generated tsvector column + GIN index
export const resource = pgTable(
  "resource",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    // ... other columns
    
    // Generated tsvector column combining title and description
    searchVector: tsvectorType("search_vector").generatedAlwaysAs(
      (): SQL =>
        sql`setweight(to_tsvector('english', coalesce(${resource.title}, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(${resource.description}, '')), 'B')`
    ),
  },
  (table) => [
    // GIN index for fast full-text search
    index("resource_search_idx").using("gin", table.searchVector),
  ]
);

// 3. Query using the sql template
function searchResources(db: Database, query: string) {
  return db
    .select({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      rank: sql<number>`ts_rank(${resource.searchVector}, websearch_to_tsquery('english', ${query}))`,
    })
    .from(resource)
    .where(
      sql`${resource.searchVector} @@ websearch_to_tsquery('english', ${query})`
    )
    .orderBy(
      sql`ts_rank(${resource.searchVector}, websearch_to_tsquery('english', ${query})) DESC`
    )
    .limit(20);
}
```

### Advantages over ILIKE

- **Word-boundary matching**: Searching "data" matches "data" and "database" but not "metadata" (unless stemmed that way).
- **Stemming**: "uploading" matches "upload", "uploaded", "uploads".
- **Ranking**: `ts_rank` returns a relevance score; results ordered by relevance.
- **Multi-column weighting**: `setweight` lets title matches rank higher than description matches.
- **GIN index**: Searches stay fast even at 100K+ rows.

### Drawbacks

- More schema complexity (generated column, custom type, GIN index).
- `websearch_to_tsquery` is strict about word boundaries — won't match partial words.
- Drizzle queries require `sql` template instead of type-safe operators.

## Approach 3: pg_trgm (Trigram Matching)

### How it works

The `pg_trgm` extension breaks text into 3-character sequences (trigrams) and uses them for similarity matching. It supports:
- `similarity(a, b)` — returns 0-1 similarity score
- `a % b` — true if similarity exceeds threshold (default 0.3)
- `word_similarity(a, b)` — word-level similarity
- `a ILIKE '%pattern%'` with GIN index acceleration (the key benefit)

### Drizzle ORM support

Requires `sql` template for `similarity()` and the `%` operator. However, `pg_trgm` also **accelerates `ILIKE`** queries — meaning you can use Drizzle's native `ilike()` operator and still get GIN-indexed performance by simply adding a trigram GIN index.

### Code example

```typescript
import { sql } from "drizzle-orm";
import { index, pgTable, text } from "drizzle-orm/pg-core";

// Need to run: CREATE EXTENSION IF NOT EXISTS pg_trgm;
// (via a custom migration)

export const resource = pgTable(
  "resource",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
  },
  (table) => [
    // GIN trigram index accelerates ILIKE queries
    index("resource_title_trgm_idx")
      .using("gin", sql`${table.title} gin_trgm_ops`),
    index("resource_desc_trgm_idx")
      .using("gin", sql`${table.description} gin_trgm_ops`),
  ]
);

// Option A: Use native ilike() — now GIN-accelerated
function searchWithIlike(db: Database, query: string) {
  return db
    .select()
    .from(resource)
    .where(or(
      ilike(resource.title, `%${query}%`),
      ilike(resource.description, `%${query}%`),
    ))
    .limit(20);
}

// Option B: Use similarity() for fuzzy matching with ranking
function searchWithSimilarity(db: Database, query: string) {
  return db
    .select({
      id: resource.id,
      title: resource.title,
      similarity: sql<number>`similarity(${resource.title}, ${query})`,
    })
    .from(resource)
    .where(sql`similarity(${resource.title}, ${query}) > 0.1`)
    .orderBy(sql`similarity(${resource.title}, ${query}) DESC`)
    .limit(20);
}
```

### Trade-offs

- **Pro**: Fuzzy matching (typo tolerance), GIN-accelerated ILIKE, similarity ranking.
- **Con**: Requires `CREATE EXTENSION pg_trgm` (may not be available on all managed Postgres providers), no stemming, less sophisticated ranking than full-text search.

## Approach 4: External Search Services (Brief Survey)

| Service | What it adds | Operational burden | When to consider |
|---|---|---|---|
| **Meilisearch** | Typo-tolerant, instant search, faceted filtering, simple API | Self-hosted or cloud (~$30/mo), sync pipeline needed | >100K docs, complex faceting, autocomplete UX |
| **Typesense** | Similar to Meilisearch, slightly more mature | Self-hosted or cloud, sync pipeline | Same as Meilisearch |
| **Elasticsearch** | Full-featured, text analysis, aggregations | Heavy ops burden, significant resource usage | Enterprise scale, complex analytics |

**Verdict for MVP**: All three require running a separate service, building a data sync pipeline, and handling consistency between Postgres and the search index. This is significant operational complexity for an MVP that needs to find resources by keyword. Revisit if/when Postgres-native search proves insufficient.

## Recommended Upgrade Path

```
MVP Launch              Post-Launch              Scale
─────────────────       ─────────────────        ─────────────────
ILIKE + OR         →    tsvector + GIN      →    External search
                        (when ranking or         (when PG can't
                        performance needed)      keep up)
```

1. **MVP**: Ship with `ILIKE`. ~10 lines of code, zero schema overhead, meets the bar.
2. **V1.1**: When users want ranked results or tables exceed ~50K rows, add `tsvector` generated columns + GIN indexes. The query layer changes but the schema migration is additive.
3. **Later**: If full-text search on Postgres becomes a bottleneck (unlikely below millions of rows), add Meilisearch/Typesense as a read-through search index.

## Sources

- **Drizzle ORM 1.0.0-rc.5 source** (installed at `node_modules/.pnpm/drizzle-orm@1.0.0-rc.5_*/node_modules/drizzle-orm/`):
  - `sql/expressions/conditions.d.ts` — `ilike`, `like`, `notIlike`, `or`, `and` operators
  - `pg-core/indexes.d.ts` — `PgIndexMethod` type includes `'gin'`, `IndexBuilderOn.using()` method
  - `pg-core/columns/custom.d.ts` — `customType` API for defining `tsvector` columns
  - `pg-core/columns/common.d.ts` — `generatedAlwaysAs()` for generated columns
  - `pg-core/codecs.d.ts` — `PostgresType` includes `'tsvector'` and `'tsquery'`
- **PostgreSQL documentation** (primary reference for PG full-text search, `pg_trgm`, GIN indexes):
  - [Chapter 12: Full Text Search](https://www.postgresql.org/docs/current/textsearch.html)
  - [pg_trgm module](https://www.postgresql.org/docs/current/pgtrgm.html)
  - [GIN Indexes](https://www.postgresql.org/docs/current/gin.html)
