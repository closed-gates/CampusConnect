# CampusConnect Backend

> Spring Boot backend for the **Unified University Portal** — a centralized platform combining academic services, educational resources, and communication tools for university students, faculty, and staff.

---

## Technology Stack

| Layer        | Technology          | Version  |
|--------------|---------------------|----------|
| Language     | Java                | 17 (LTS) |
| Framework    | Spring Boot         | 3.3.2    |
| Security     | Spring Security     | 6.x      |
| Database     | H2 (dev) / MySQL (prod) | —    |
| Build Tool   | Maven               | 3.9+     |

---

## Prerequisites

- **Java 17+** installed (`java -version`)
- **Maven 3.9+** installed (`mvn -version`)
- **MySQL** installed (only for production profile)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd CampusConnect/Arham/backend
```

### 2. Run in Development Mode (H2 In-Memory DB)

No database setup required — H2 runs entirely in memory.

```bash
mvn spring-boot:run
```

The server starts at: **http://localhost:8080**

### 3. Verify the server is running

```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "UP",
  "message": "CampusConnect backend is running",
  "application": "Unified University Portal",
  "version": "0.1.0-SNAPSHOT",
  "timestamp": "2024-..."
}
```

### 4. H2 Database Console (Dev only)

Browse to: **http://localhost:8080/h2-console**

| Field    | Value                                       |
|----------|---------------------------------------------|
| JDBC URL | `jdbc:h2:mem:campusconnectdb`               |
| Username | `sa`                                        |
| Password | *(leave blank)*                             |

---

## Production Setup (MySQL)

### 1. Create the MySQL database

```sql
CREATE DATABASE campusconnect;
```

### 2. Set environment variables

```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/campusconnect?useSSL=false&serverTimezone=UTC
export SPRING_DATASOURCE_USERNAME=your_mysql_user
export SPRING_DATASOURCE_PASSWORD=your_mysql_password
```

### 3. Run with production profile

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

---

## Project Structure

```
backend/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/campusconnect/backend/
    │   │   ├── BackendApplication.java     ← Entry point
    │   │   ├── controller/                 ← REST controllers
    │   │   ├── service/                    ← Business logic
    │   │   ├── repository/                 ← Database access (JPA)
    │   │   ├── model/                      ← JPA entity classes
    │   │   ├── dto/                        ← Data Transfer Objects
    │   │   ├── config/                     ← App configuration (CORS, Security)
    │   │   ├── security/                   ← JWT, filters, UserDetails
    │   │   └── exception/                  ← Custom exceptions & handler
    │   └── resources/
    │       ├── application.properties      ← Profile selector
    │       ├── application-dev.properties  ← H2 dev config
    │       └── application-prod.properties ← MySQL prod config
    └── test/
        └── java/com/campusconnect/backend/
            └── BackendApplicationTests.java
```

---

## API Endpoints

| Method | Endpoint       | Description              | Auth Required |
|--------|----------------|--------------------------|---------------|
| GET    | `/api/health`  | Server health check      | No            |

> More endpoints will be added in Phases 2–6.

---

## Development Phases

| Phase | Module                        | Status       |
|-------|-------------------------------|--------------|
| 1     | Project Setup                 | ✅ Complete  |
| 2     | Authentication & RBAC         | ⏳ Planned   |
| 3     | Faculty & Staff Directory     | ⏳ Planned   |
| 4     | Club Recruitment & Notices    | ⏳ Planned   |
| 5     | Notification & Preferences    | ⏳ Planned   |
| 6     | Faculty Attendance Tracking   | ⏳ Planned   |
| 7     | Integration & Testing         | ⏳ Planned   |
| 8     | Documentation & Finalization  | ⏳ Planned   |

---

## Running Tests

```bash
mvn test
```

---

## Build

```bash
mvn clean package -DskipTests
```

The JAR will be in `target/backend-0.1.0-SNAPSHOT.jar`.

---

## Security Notes

- **Never commit real credentials** to Git.
- Use environment variables for all sensitive configuration in production.
- JWT-based authentication will be implemented in Phase 2.
- Role-Based Access Control (RBAC) restricts endpoints by user role.
