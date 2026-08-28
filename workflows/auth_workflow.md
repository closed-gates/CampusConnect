# Authentication & RBAC Workflow

## Feature Summary

Real JWT-based authentication with 3 roles (STUDENT, FACULTY, ADMIN). All pages are
protected — unauthenticated users are redirected to login. Login accepts userId OR email
+ password. New users can register and choose their role.

---

## Default Seed Accounts (auto-created on first boot)

| Role | User ID | Email | Password |
|---|---|---|---|
| STUDENT | `STU001` | `student@campus.edu` | `student123` |
| FACULTY | `FAC001` | `faculty@campus.edu` | `faculty123` |
| ADMIN | `ADM001` | `admin@campus.edu` | `admin123` |

---

## Communication Flows

### Flow A — Login

```
1. [View] LoginView: user types userId/email + password → submits form
2. [Controller] useLoginController.handleLogin()
3.   POST /api/auth/login  { identifier, password }
4. [Backend Filter] JwtAuthFilter: no Bearer header → skip (public route)
5. [Backend Controller] AuthController.login(AuthRequest)
6. [Backend Service] AuthService.login()
7.   → findByUserId(identifier) OR findByEmail(identifier)
8.   → passwordEncoder.matches(input, storedHash)
9.   → jwtService.generateToken(user)   ← signs JWT with userId, role, email, fullName
10. [Backend] Returns AuthResponse { success, token, role, userId, fullName, email, expiresIn }
11. [Controller] storeAuth(data) → saves to localStorage (cc_token, cc_role, cc_userId, ...)
12. [Controller] navigate('/dashboard')
13. [View] ProtectedRoute checks isTokenValid() → renders DashboardView
```

### Flow B — Access Protected Route Without Login

```
1. [User] Navigates to http://localhost:5173/dashboard
2. [View] App.jsx: route nested inside <ProtectedRoute>
3. [Component] ProtectedRoute calls isTokenValid()
4.   → checks localStorage for cc_token + cc_expires
5.   → no token OR expired → returns <Navigate to="/" replace />
6. [View] LoginView rendered
```

### Flow C — Authenticated API Call

```
1. [Frontend] Any feature controller calls fetch('/api/attendance/...')
2. [Vite Proxy] Forwards to http://localhost:8080/api/attendance/...
   with Authorization: Bearer <token> header
3. [Backend Filter] JwtAuthFilter.doFilterInternal()
4.   → reads Authorization header
5.   → jwtService.isTokenValid(token)   ← checks signature + expiry
6.   → jwtService.extractUserId(), extractRole()
7.   → SecurityContextHolder.setAuthentication(...)
8. [Spring Security] Route requires authentication → PASSES
9. [Backend Controller] Handles request normally
10. [Response] Returns data to frontend
```

### Flow D — Registration

```
1. [View] SignupView: user fills fullName, userId, email, password, role → submits
2. [Controller] useSignupController.handleSignup()
3.   Client validation: passwords match, length ≥ 6, all fields present
4.   POST /api/auth/register { fullName, userId, email, password, role }
5. [Backend Service] AuthService.register()
6.   → existsByUserId() + existsByEmail() → error if duplicate
7.   → passwordEncoder.encode(password)   ← BCrypt hash
8.   → userRepo.save(newAppUser)
9.   → jwtService.generateToken(newUser)
10. Returns AuthResponse with JWT
11. [Controller] storeAuth(data) + navigate('/dashboard')
```

### Flow E — Logout

```
1. [View] User clicks Logout in Sidebar
2. [Component] createLogoutHandler(navigate)()
3.   → POST /api/auth/logout (best-effort, fire & forget)
4.   → clearAuth(): removes cc_token, cc_role, cc_userId, cc_fullName, cc_email,
                               cc_expires, userRole from localStorage
5.   → navigate('/')
6. [View] LoginView rendered
7. [Component] ProtectedRoute: isTokenValid() → false → blocks all protected routes
```

---

## Files Involved

| Layer | File | Change |
|---|---|---|
| Backend Model | `model/AppUser.java` | **[NEW]** JPA entity for app_users table |
| Backend Repo | `repository/AppUserRepository.java` | **[NEW]** findByUserId, findByEmail |
| Backend Config | `config/PasswordEncoderConfig.java` | **[NEW]** BCrypt strength-12 bean |
| Backend Security | `security/JwtService.java` | **[NEW]** JWT generate/validate/extract |
| Backend Security | `security/JwtAuthFilter.java` | **[NEW]** OncePerRequestFilter reads Bearer token |
| Backend DTO | `dto/AuthRequest.java` | identifier, userId, role fields |
| Backend DTO | `dto/AuthResponse.java` | token, role, userId, fullName, email, expiresIn |
| Backend Service | `service/AuthService.java` | Real BCrypt + JWT login/register + seed |
| Backend Config | `config/SecurityConfig.java` | JWT filter + stateless session + route rules |
| Backend Env | `.env` | JWT_SECRET + JWT_EXPIRY_MS |
| Backend Props | `application-prod.properties` | jwt.secret + jwt.expiry-ms |
| Frontend Model | `models/authModel.js` | ROLES, storeAuth, clearAuth, isTokenValid |
| Frontend Controller | `controllers/authController.js` | Real API calls, error state |
| Frontend View | `views/components/ProtectedRoute.jsx` | **[NEW]** isTokenValid guard |
| Frontend Router | `App.jsx` | All routes wrapped in ProtectedRoute |
| Frontend View | `views/pages/LoginView.jsx` | Error banner, identifier field |
| Frontend View | `views/pages/SignupView.jsx` | Role selector, error banner |
| Frontend View | `views/components/Sidebar.jsx` | User info badge, real logout |
| Frontend CSS | `index.css` | Error banner, user-info, demo hint styles |
