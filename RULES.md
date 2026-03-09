# CODEX_RULES.md
## NestJS + GraphQL Architecture Rules

### 1. Core Principles
- Use **feature-first (domain-first) modular architecture**
- One business domain = one NestJS module
- Prefer explicit, readable code over abstractions
- Optimize for maintainability and scalability

---

### 2. Project Structure

src/
app.module.ts
main.ts

common/
graphql/
modules/


Each feature MUST follow:
modules/<feature>/
<feature>.module.ts
<feature>.resolver.ts
<feature>.service.ts

inputs/
models/
domain/
infra/

Rules:
- No horizontal layers at root level
- No cross-feature internal imports
- Shared logic → `common/`

---

### 3. Resolver Rules (GraphQL Layer)

Resolvers MUST:
- Be thin
- Only parse args, apply guards, call services

Resolvers MUST NOT:
- Contain business logic
- Access database directly

---

### 4. Service Rules (Application Layer)

Services MUST:
- Contain business logic and use cases
- Control transactions
- Call repositories

Services MUST NOT:
- Depend on GraphQL-specific types
- Use decorators like `@Args`, `@Context`

---

### 5. Repository Rules (Infrastructure Layer)

Repositories MUST:
- Encapsulate all DB/API access
- Expose intent-based methods

Repositories MUST NOT:
- Contain business logic
- Know about GraphQL models

---

### 6. Domain Rules

Domain layer:
- Contains pure business logic
- Is independent of NestJS and GraphQL
- May include entities, policies, value objects

---

### 7. GraphQL Models & Inputs

- `@ObjectType()` → `models/`
- `@InputType()` → `inputs/`
- DB entities MUST NOT be exposed directly
- Mapping between domain ↔ GraphQL is explicit

---

### 8. Validation

- Use `class-validator`
- Enable global `ValidationPipe`
- Domain errors → custom exceptions

---

### 9. Auth & Authorization

- Guards → `common/guards`
- Use decorators like `@CurrentUser()`
- Authorization logic close to domain

---

### 10. Error Handling

- No raw errors leaking to client
- Centralized GraphQL exception filters
- Domain errors are explicit

---

### 11. Performance

- Use DataLoader for N+1 problems
- DataLoaders are request-scoped
- DataLoader logic lives in `graphql/`

---

### 12. Configuration

- Centralized `ConfigModule`
- Validate env variables at startup
- No direct `process.env` usage

---

### 13. Testing

- Services are unit-testable
- Repositories are mockable
- Prefer integration tests for GraphQL

---

### 14. Forbidden Anti-Patterns

❌ Fat resolvers  
❌ DB access in resolvers  
❌ Business logic in guards  
❌ Cross-module tight coupling  
❌ One global god-service

---

### 15. Defaults

- Architecture: Modular Monolith
- GraphQL: Code-first
- Validation: class-validator
- Auth: Guards + policies
- Data access: Repository pattern

---

### 16. Rule of Thumb

If unsure:
- Put logic in services
- Keep resolvers thin
- Make dependencies explicit