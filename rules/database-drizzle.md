# Database & Drizzle ORM

This app uses SQLite and drizzle ORM.

Generate SQL migrations by running this:

```sh
npm run db:generate
```

IMPORTANT: Do NOT generate SQL migration files by hand! This is wrong.

## Drizzle migration conflicts during rebase

When rebasing a branch that has drizzle migrations conflicting with upstream (e.g., both have `0023_*.sql`):

1. Keep upstream's migration files (they're already deployed to production)
2. Rename the PR's conflicting migration to the next available index (e.g., `0023_romantic_mantis.sql` → `0025_romantic_mantis.sql`)
3. Update `drizzle/meta/_journal.json` to include all migrations with correct indices
4. Create/update the snapshot file (`drizzle/meta/00XX_snapshot.json`) with the new index, updating `prevId` to reference the previous snapshot's `id`
5. If the PR had subsequent commits that deleted/modified its migration files, those changes become no-ops after renaming — just accept the deletion conflicts by staging the renamed files

## SQLite text columns and TypeScript type narrowing

When a column is defined as `text("columnName")` in the drizzle schema, the ORM returns `string | null` at runtime. If a function expects a narrower union type (e.g., `StoredChatMode | undefined`), you need an explicit cast at the call site:

```ts
// Example: chatMode column is text("chatMode") → string | null
// migrateStoredChatMode expects StoredChatMode | undefined
migrateStoredChatMode(chat.chatMode as Parameters<typeof migrateStoredChatMode>[0]);
```

Using `Parameters<typeof fn>[0]` keeps the cast tied to the function's actual signature, so it stays correct if the type changes. This pattern applies whenever drizzle's broad `string | null` return type must be narrowed to a specific string-literal union expected by a consumer function
