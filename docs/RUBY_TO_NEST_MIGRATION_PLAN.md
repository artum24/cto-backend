# Міграція Ruby (Rails) → NestJS: аналіз і план

## 1. Що вже зроблено

### 1.1 Інфраструктура
- **NestJS + GraphQL (Apollo)** — код-фірст, `schema.gql` генерується
- **Prisma** — схема з Rails (таблиці, зв’язки, індекси), міграції + Supabase (directUrl, drift описані в `PRISMA_SUPABASE.md`)
- **Auth** — Supabase JWT guard, `@CurrentUser()`, контекст `user` + `authUser`
- **Конфіг** — `ConfigModule` + Joi, `.env.example`, health check
- **Спільне** — `BigInt` scalar/mapper, GraphQL exception filter, enums (OrderBy, PhoneValidation, CompanyType)
- **RULES.md** — архітектура: feature-first, тонкі резолвери, логіка в сервісах, без доступу до БД з резолверів

### 1.2 Доменні модулі та API

| Модуль      | Query | Mutation | Стан |
|------------|-------|----------|-----|
| **Auth**   | —     | —        | Guard + Supabase client, контекст користувача |
| **User**   | `me`, `userInvitations` | — | Тільки читання профілю та запрошень |
| **Company**| `currentUserCompany`, `companyMembers` | `createCompany` | Створення компанії + storage + базові категорії; оновлення компанії та запрошення — немає |
| **Client** | `clients`, `client`, `validatePhone` | — | Тільки читання + валідація телефону; **немає create/update/archive** |
| **Vehicle**| `vehicles`, `vehicleMakes`, `vehicleModels`, `vehicleModelsByMake`, `vehicleMakesByType` | — | Тільки читання + фільтри/сортування; **немає create/update/archive** |
| **Storage**| `storage` (по company) | — | Один склад по компанії |
| **Categories**| `categories` (по storage через me) | `createCategory`, `updateCategory`, `archiveCategory` | Повний CRUD по категоріях складу |
| **Nova Poshta**| `getNpCity`, `getNpAddress` | — | Зовнішній API для адрес |

### 1.3 База даних (Prisma schema з Rails)

**Є в схемі, використовуються в Nest:**  
companies, users, clients, vehicles, vehicle_makes, vehicle_models, storages, categories, invitations.

**Є в схемі, ще не використовуються в API:**
- **details** — номенклатура (артикул, кількість, ціни, категорія, постачальник, storage)
- **supliers** — постачальники по складу (Rails-тип: supliers)
- **suppliers** — окрема таблиця suppliers (company_id)
- **tasks** — завдання по авто (vehicle_id, status)
- **detail_histories** — рухи по деталях (action_type, count_diff, user, task, storage)
- **vehicle_histories** — історія по авто (distance, service, task)
- **services** — довідник послуг
- **workspaces** — робочі місця компанії
- **reports** — звіти (job_id, data_errors)
- **active_storage_*** — Rails Active Storage (блоби, attachments)
- **ar_internal_metadata**, **schema_migrations**, **uploads** — службові Rails

---

## 2. План наступних кроків

### Фаза A: Завершити базовий CRUD (пріоритет 1)

1. **Client**
   - [ ] `createClient` (name, phone, company_id з контексту), з перевіркою унікальності телефону (вже є `validatePhone`).
   - [ ] `updateClient` (id, name, phone).
   - [ ] `archiveClient` (id) — аналогічно `archiveCategory` (archived + archived_at).
   - [ ] Inputs: `CreateClientInput`, `UpdateClientInput`; при потребі — фільтр по archived у `clients`.

2. **Vehicle**
   - [ ] `createVehicle` (client_id, рік, номер, VIN, тощо; make/model id або name — за логікою Rails).
   - [ ] `updateVehicle` (id + поля для оновлення).
   - [ ] `archiveVehicle` (id).
   - [ ] Inputs + валідація (унікальність номера в межах компанії, якщо потрібно).

3. **Company**
   - [ ] `updateCompany` (address, city, city_ref, address_ref, house_number, title тощо) — тільки для поточної компанії користувача.
   - [ ] За потреби: `inviteMember` (email) — створення запису в `invitations` + відправка листа (або тільки запис, як у Rails).

4. **Invitations**
   - [ ] Прийняття запрошення: mutation `acceptInvitation(invitationId)` — створення/оновлення `users` (company_id, email), видалення або маркування invitation, оновлення Supabase Auth (admin) при потребі.
   - [ ] Відхилення: `declineInvitation(invitationId)` — видалення або soft-delete запису.

5. **Схема GraphQL**
   - [ ] Перегенерувати/перевірити `schema.gql` після додавання Category/Storage у резолвери (зараз у schema.gql їх може не бути, якщо не експортовано в кореневому модулі).

---

### Фаза B: Склад і номенклатура (пріоритет 2)

6. **Supliers (постачальники складу)**
   - [ ] Модуль `supliers` (або `suppliers` з маппінгом на `supliers`): Query `supliers(storageId)` або по поточному storage через me.
   - [ ] CRUD: create/update/archive постачальника (прив’язка до storage_id).

7. **Details (номенклатура)**
   - [ ] Модуль `details`: Query `details(storageId, categoryId?, search?)` з пагінацією/фільтрами.
   - [ ] Mutations: `createDetail`, `updateDetail`, `archiveDetail` (article, name, count, minimum_count, prices, category_id, suplier_id, storage_id).
   - [ ] Можливо окремий query `detail(id)` для форми редагування.

8. **Detail histories (рухи)**
   - [ ] Query `detailHistories(detailId?, storageId?, taskId?)` для історії рухів.
   - [ ] Mutation `recordDetailMovement` (detail_id, storage_id, action_type, count_diff, task_id?, user_id з контексту, comment?) — створення запису + оновлення `details.count` за логікою Rails.

---

### Фаза C: Завдання та сервіси авто (пріоритет 3)

9. **Services (довідник послуг)**
   - [ ] Query `services` (список для вибору в завданнях/історії).
   - [ ] За потреби: адмін CRUD для послуг (якщо в Rails було).

10. **Tasks (завдання по авто)**
    - [ ] Query `tasks(vehicleId?)` з опціональним фільтром по статусу.
    - [ ] Mutations: `createTask` (vehicle_id, title, status), `updateTask`, можливо закриття задачі.

11. **Vehicle histories**
    - [ ] Query `vehicleHistories(vehicleId?, taskId?)`.
    - [ ] Mutation `addVehicleHistory` (task_id, service_id, distance, status) — прив’язка до task + service.

12. **Workspaces**
    - [ ] За потреби: Query `workspaces(companyId)` та CRUD для робочих місць (якщо використовуються в бізнес-логіці).

---

### Фаза D: Файли та звіти (пріоритет 4)

13. **Active Storage (Rails)**
    - Варіанти: залишити таблиці для сумісності з існуючими даними і не експонувати в GraphQL; або замінити на **Supabase Storage** і нові сутності (наприклад, `attachments` з key/path). Якщо міграція файлів не в пріоритеті — лишити на потім.

14. **Reports**
    - [ ] Якщо в Rails були фонові звіти по `job_id`: Query `report(jobId)` або список; при потребі — mutation для постановки в чергу (окремий job runner або Supabase Edge/queue).

---

### Фаза E: Якість і архітектура

15. **Валідація**
    - [ ] У всі нові inputs додати `class-validator` (IsString, IsOptional, Min, Max, IsUUID тощо) і переконатися, що глобальний `ValidationPipe` увімкнений для GraphQL (або перевірка в сервісах).

16. **Помилки**
    - [ ] Замість `throw new Error('...')` використовувати доменні помилки та централізований GraphQL exception filter (наприклад, `GraphqlExceptionFilter` з RULES), щоб не витікали внутрішні повідомлення.

17. **Тести**
    - [ ] Unit-тести для сервісів (Client, Vehicle, Company, Categories, далі Details/Tasks).
    - [ ] Інтеграційні тести для критичних мутацій (createCompany, createClient, acceptInvitation).

18. **DataLoader**
    - [ ] За наявності N+1 (наприклад, vehicles по client, details по category) — додати DataLoader’и в `common/graphql` згідно RULES.

19. **Repository шар**
    - [ ] За бажанням відповідно до RULES: винести Prisma-виклики з сервісів у окремі repository (наприклад, `ClientRepository`, `VehicleRepository`) і лишити в сервісах тільки оркестрацію та бізнес-правила.

---

## 3. Короткий чеклист по пріоритетах

**Негайно (щоб фронт міг повністю замінити Rails API):**
- Client: create / update / archive.
- Vehicle: create / update / archive.
- Company: update.
- Invitations: accept / decline (і при потребі invite).

**Далі:**
- Details + Detail histories + Supliers (склад і номенклатура).
- Tasks + Vehicle histories + Services.
- Workspaces, Reports, файли (за потреби).

**Паралельно:**
- Валідація, помилки, тести, опційно DataLoader і repositories.

---

## 4. Примітки

- **suppliers vs supliers:** у схемі є і `suppliers` (company_id), і `supliers` (storage_id). Потрібно узгодити з бізнесом, яку сутність використовувати в UI і чи потрібні обидві в API.
- **schema.gql:** після додавання нових типів/полей варто перезапустити `nest start` або згенерувати схему вручну, щоб фронт бачив актуальний API.
- Якщо є доступ до старого Rails-проєкту — варто порівняти контролери/сервіси з цим планом і додати відсутні endpoints або бізнес-правила в опис фази.
