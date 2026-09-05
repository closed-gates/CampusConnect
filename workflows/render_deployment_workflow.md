# Render Production Deployment Workflow

## Overview & Goal

This workflow outlines the exact sequence of configurations and file updates required to transition CampusConnect from local development to production hosting on **Render**, along with complete step-by-step directions for setting up the services on the Render Dashboard.

> **Note:** As specified, this deployment plan is **not** kept backwards-compatible with `localhost`. All configurations, CORS rules, WebSocket broker URLs, and client fetch paths will target the deployed Render production URLs and environment variables directly.

---

## Target Architecture & Infrastructure

| Layer | Hosting Provider / Type | Production URL / Endpoint |
| :--- | :--- | :--- |
| **Frontend** | Render Static Site | `https://campusconnect-ui.onrender.com` |
| **Backend** | Render Web Service (Docker / Java 17) | `https://campusconnect-api.onrender.com` |
| **Database** | Neon PostgreSQL (Cloud) | `ep-plain-sky-azj97mzc.c-3.ap-southeast-1.aws.neon.tech` |
| **Storage** | Local Ephemeral Container Storage (`uploads/`) | Persisted per-instance run (external cloud storage recommended for permanent uploads) |

---

## Communication Flow

```
User Browser
  │
  ├─▶ 1. [HTTPS] Loads React SPA from Render Static Site (https://campusconnect-ui.onrender.com)
  │
  ├─▶ 2. [HTTPS REST] apiClient.js calls Render Web Service (https://campusconnect-api.onrender.com/api/...)
  │         │
  │         ▼
  │     Spring Boot FilterChain (SecurityConfig + CorsConfig)
  │         │ Validate Origin: https://campusconnect-ui.onrender.com
  │         │ Validate JWT Bearer Token
  │         ▼
  │     Controllers (@RestController)
  │         │
  │         ▼
  │     Services (@Service)
  │         │
  │         ▼
  │     Spring Data JPA Repositories
  │         │
  │         ▼
  │     Neon Cloud PostgreSQL (sslmode=require)
  │
  └─▶ 3. [WSS / SockJS] Stomp Client connects to Render Web Service (/ws)
            │
            ▼
        WebSocketConfig (StompEndpointRegistry)
            │ Validate Origin: https://campusconnect-ui.onrender.com
            ▼
        Message Broker (/topic/seats/{id}, /topic/course.{id}.{sub})
```

---

## Code & Config Changes (Pending Execution)

### 1. Backend (`backend/`)

* [ ] `backend/src/main/resources/application.properties`
  * **Change:** Set `server.port=${PORT}`.
  * **Rationale:** Render binds the web container to an arbitrary dynamic port defined in the `PORT` env var.
* [ ] `backend/src/main/java/com/campusconnect/backend/config/CorsConfig.java`
  * **Change:** Remove `http://localhost:*`; replace with `https://*.onrender.com` (and frontend production domain).
  * **Rationale:** Direct cross-origin communication between the static site and the backend API without local development allowances.
* [ ] `backend/src/main/java/com/campusconnect/backend/config/WebSocketConfig.java`
  * **Change:** Update `setAllowedOriginPatterns` to `https://*.onrender.com`.
  * **Rationale:** Allows STOMP / SockJS connections from the Render frontend origin.
* [ ] `backend/Dockerfile` *(New File)*
  * **Purpose:** Multi-stage build for the Spring Boot backend container.
  * **Build stage:** `maven:3.9-eclipse-temurin-17` runs `mvn clean package -DskipTests`.
  * **Runtime stage:** `eclipse-temurin:17-jre-alpine` runs `java -jar app.jar`.

### 2. Frontend (`frontend/`)

* [ ] `frontend/src/services/apiClient.js`
  * **Change:** Point `authFetch` directly to `import.meta.env.VITE_API_BASE_URL` without relative Vite proxy dependencies.
* [ ] `frontend/src/models/courseChatModel.js`
  * **Change:** Update `CHAT_WS_URL` to `${import.meta.env.VITE_API_BASE_URL}/ws`.
* [ ] `frontend/src/controllers/registrationController.js`
  * **Change:** Update WebSocket endpoint from `window.location.host` to the backend Render domain (`import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws') + '/ws/websocket'`).
* [ ] `frontend/public/_redirects` *(New File)*
  * **Content:** `/* /index.html 200`
  * **Rationale:** Ensures Render Static Site redirects all deep routes (`/dashboard`, `/login`, `/admin/payments`, etc.) to `index.html`.

---

## Render Environment Variables Specification

### Backend Service (Render Web Service)
| Variable Key | Value / Source |
| :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | Neon JDBC URL (`jdbc:postgresql://...neon.tech/neondb?sslmode=require&channel_binding=require`) |
| `SPRING_DATASOURCE_USERNAME` | `neondb_owner` |
| `SPRING_DATASOURCE_PASSWORD` | Neon DB password |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` |
| `JWT_SECRET` | 256-bit Hex secret key |
| `JWT_EXPIRY_MS` | `86400000` (24 hours) |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `OPENAI_API_KEY` | OpenAI API key (if using AI chatbot) |

### Frontend Service (Render Static Site)
| Variable Key | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://campusconnect-api.onrender.com` *(Replace with your actual backend service URL)* |

---

## Step-by-Step Render Deployment Guide

### Phase 1: Git Preparation
1. Ensure all code changes from above are committed to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure project for Render production deployment"
   git push origin main
   ```

---

### Phase 2: Deploy Backend Web Service (Render)

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top navigation and select **Web Service**.
3. Under **Connect a repository**, choose your `CampusConnect` repository.
4. Fill in the service configuration details:
   * **Name:** `campusconnect-api` *(or your preferred name)*
   * **Region:** Select **Singapore (Southeast Asia)** *(matches Neon `ap-southeast-1` to minimize DB latency)*
   * **Branch:** `main`
   * **Root Directory:** `backend`
   * **Runtime:** **Docker** *(Render detects `backend/Dockerfile` automatically)*
   * **Instance Type:** **Free**
5. Scroll down to the **Environment Variables** section and click **Add Environment Variable** for each:
   * `SPRING_PROFILES_ACTIVE` = `prod`
   * `SPRING_DATASOURCE_URL` = `jdbc:postgresql://ep-plain-sky-azj97mzc.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   * `SPRING_DATASOURCE_USERNAME` = `neondb_owner`
   * `SPRING_DATASOURCE_PASSWORD` = `<your_neon_password>`
   * `SPRING_JPA_HIBERNATE_DDL_AUTO` = `update`
   * `JWT_SECRET` = `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970`
   * `STRIPE_SECRET_KEY` = `<your_stripe_secret_key>`
6. Click **Create Web Service**.
7. Wait for the Docker build and startup logs to complete. Once finished, you will see `Started BackendApplication in X seconds` and a status of **Live**.
8. **Copy your backend public URL** at the top of the page (e.g. `https://campusconnect-api.onrender.com`).

---

### Phase 3: Deploy Frontend Static Site (Render)

1. Return to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Static Site**.
3. Select your `CampusConnect` GitHub repository.
4. Fill in the frontend configuration details:
   * **Name:** `campusconnect-ui` *(or your preferred name)*
   * **Branch:** `main`
   * **Root Directory:** `frontend`
   * **Build Command:** `npm run build`
   * **Publish Directory:** `dist`
5. Under **Environment Variables**, click **Add Environment Variable**:
   * `VITE_API_BASE_URL` = `https://campusconnect-api.onrender.com` *(Paste the exact backend URL from Phase 2)*
6. Click **Create Static Site**.
7. Configure Single Page Application (SPA) routing:
   * While the site builds, go to **Settings** in the left sidebar of the static site.
   * Scroll down to **Redirects / Rewrites** and click **Add Rule**.
   * Set:
     * **Type:** `Rewrite`
     * **Source:** `/*`
     * **Destination:** `/index.html`
   * Click **Save Changes**.
8. Once the build completes, your frontend status will display **Live**. Note your frontend URL (e.g. `https://campusconnect-ui.onrender.com`).

---

## Verification & Deployment Validation Plan

Once deployed, perform these checks:
1. **Health Check:** Open `https://campusconnect-api.onrender.com/api/auth/test` or check Render service logs to verify Tomcat started on port `10000` (or dynamic `$PORT`).
2. **Database Connectivity:** Verify the Hikari pool connected to Neon PostgreSQL without connection timeout or SSL issues.
3. **Frontend Initial Load:** Open `https://campusconnect-ui.onrender.com` and verify login page displays without 404s.
4. **CORS Validation:** Log into the app; inspect the browser Developer Tools Network tab on `/api/auth/login` to confirm `Access-Control-Allow-Origin: https://campusconnect-ui.onrender.com` is accepted.
5. **SPA Navigation & Refresh:** Navigate to `/dashboard` or `/messaging` and press browser refresh (`F5`) to confirm the rewrite rule serves `index.html`.
6. **Real-Time WebSocket Test:** Verify course chat sub-channel and course registration seat counter STOMP handshakes connect successfully over `wss://`.
