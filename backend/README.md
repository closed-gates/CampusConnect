# CampusConnect – Shared Backend

> **Phase 1 – Auth Stub (No Database)**
> All auth endpoints accept any input and return stub responses.
> Database + JWT integration is Phase 2.

---

## Tech Stack

| Layer       | Technology          | Version |
|-------------|---------------------|---------|
| Language    | Java                | 17      |
| Framework   | Spring Boot         | 3.3.2   |
| Build Tool  | Maven               | 3.x     |
| Database    | None (Phase 1)      | –       |

---

## Prerequisites

- Java 17+ (`java -version`)
- Maven 3.8+ (`mvn -version`)

---

## Running the Backend

```bash
# From the repo root
cd backend
mvn spring-boot:run
```

The server starts on **http://localhost:8080**.

---

## API Endpoints (Phase 1 Stubs)

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| POST   | `/api/auth/login`     | Accepts any credentials → stub OK  |
| POST   | `/api/auth/register`  | Accepts any data → stub OK         |
| POST   | `/api/auth/logout`    | Always succeeds → stub OK          |

### Example: Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test"}'
```

Response:
```json
{
  "success": true,
  "message": "Login successful – Phase 1 stub. Database integration pending."
}
```

---

## Project Structure

```
backend/
├── pom.xml
└── src/
    └── main/
        ├── java/com/campusconnect/backend/
        │   ├── CampusConnectApplication.java   ← Entry point
        │   ├── controller/
        │   │   └── AuthController.java         ← Auth endpoints
        │   ├── dto/
        │   │   ├── AuthRequest.java            ← Request DTO
        │   │   └── AuthResponse.java           ← Response DTO
        │   └── config/
        │       ├── SecurityConfig.java         ← Spring Security
        │       └── CorsConfig.java             ← CORS for React
        └── resources/
            └── application.properties
```

---

## Phase 2 – What Needs to Be Done

1. **Uncomment JPA + DB dependencies** in `pom.xml`
2. **Create `User` and `Role` entities** in `model/`
3. **Create `UserRepository`** in `repository/`
4. **Implement `UserDetailsServiceImpl`** in `security/`
5. **Implement `JwtService`** (generate + validate tokens)
6. **Create `JwtAuthFilter`** (intercept + validate Bearer tokens)
7. **Update `AuthController`**:
   - `login` → BCrypt verify + issue JWT
   - `register` → hash password + save user + issue JWT
8. **Update `SecurityConfig`** → add JWT filter chain + RBAC rules
9. **Remove datasource exclusions** from `application.properties`
10. **Configure H2 (dev)** and **MySQL (prod)** profiles

---

## CORS

The backend accepts requests from:
- `http://localhost:5173` (Vite — React frontend)
- `http://localhost:3000` (CRA fallback)

Update `CorsConfig.java` with the production URL before deployment.
