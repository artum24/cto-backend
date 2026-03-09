# Prisma + Supabase: міграції та drift

## Drift (розширення pg_cron, pg_net тощо)

При `npx prisma migrate dev` Prisma може показувати **drift**, бо в Supabase БД є розширення, яких немає в наших міграціях (pg_cron, pg_graphql, pg_net, pgcrypto, pgjwt, supabase_vault).

**Завжди обирай N** на питання «Do you want to continue? All data will be lost.» — reset **не** потрібен, дані не чіпай.

Цей drift безпечно ігнорувати.

## Як створювати нові міграції

1. Вносиш зміни в `prisma/schema.prisma`.
2. Запускаєш `npx prisma migrate dev --name опис_зміни`.
3. Якщо з’явиться повідомлення про drift — **натисни N**.
4. Prisma створить нову міграцію; після цього можна продовжувати роботу.

Для застосування вже існуючих міграцій (CI/production) використовуй **тільки**:

```bash
npx prisma migrate deploy
```

`migrate deploy` не перевіряє drift і не пропонує reset.

## «The migration … was modified after it was applied»

Це буває, якщо файл міграції змінювали після того, як її вже застосували. Щоб checksum знову збігся:

```bash
npx prisma migrate resolve --rolled-back 20250309100000_supabase_extensions
npx prisma migrate deploy
```

Якщо після цього `migrate dev` все одно скаржиться на «modified», можна один раз перезаписати запис міграції в БД (підключись до БД через Supabase SQL Editor або psql):

```sql
DELETE FROM _prisma_migrations WHERE migration_name = '20250309100000_supabase_extensions';
```

Після цього виконай `npx prisma migrate deploy` — міграція застосується знову з актуальним checksum.

Далі **не змінюй** вміст вже застосованих міграцій.
