# @mydietitian/backend

Backend API server for MyDietitian, built with Express 5 on Bun and TypeScript strict mode.

## Architecture & Layering Rules

The codebase strictly enforces unidirectional layered architecture:

```
Routes -> Controller -> Service -> Repository
```

- **Routes (`*.routes.ts`)**: Route definitions only (`path -> validate(Dto) -> controller`).
- **Controllers (`*.controller.ts`)**: Thin HTTP handlers. Read `req`, invoke ONE service method, format cookies, and return `ApiResponse`. Never import Prisma or `auth` directly. Never contain business logic.
- **Services (`*.service.ts`)**: Encapsulate all business logic. Call Better Auth (`auth.api.*`) and repositories. Never touch `req` or `res`. Throw `ApiError` on failures.
- **Repositories (`*.repository.ts`)**: Dedicated database access layer. Only place in the module importing `prisma` from `@mydietitian/db`. Select only safe fields (never password hashes/tokens).

## Auth Endpoints

> **Note on Mobile Client vs. Web/API**:
>
> - The Expo mobile client uses Better Auth's native `/api/auth/*` endpoints directly via `@better-auth/expo`.
> - The `/api/v1/auth/*` endpoints below are designed for web/admin and external API consumers.

| Method | Endpoint                       | Access        | Description                                                                          |
| ------ | ------------------------------ | ------------- | ------------------------------------------------------------------------------------ |
| `POST` | `/api/v1/auth/register`        | Public        | Create account via `auth.api.signUpEmail` (201 Created)                              |
| `POST` | `/api/v1/auth/login`           | Public        | Sign in via `auth.api.signInEmail`; rejects banned users with `USER_BANNED`          |
| `POST` | `/api/v1/auth/logout`          | Authenticated | Sign out via `auth.api.signOut`; clears session cookies                              |
| `POST` | `/api/v1/auth/forgot-password` | Public        | Request password reset link; uniform 200 response (prevents user enumeration)        |
| `POST` | `/api/v1/auth/reset-password`  | Public        | Reset password with token; returns 400 `INVALID_OR_EXPIRED_TOKEN` if invalid/expired |
| `GET`  | `/api/v1/auth/me`              | Authenticated | Retrieve current user profile via repository                                         |
| `GET`  | `/api/v1/auth/admin-check`     | Admin only    | RBAC demo route protected by `requireRole(ROLES.ADMIN)`                              |

## Error & Response Conventions

- **Success**: Always respond with `ApiResponse.ok(res, message, data)` or `ApiResponse.created(res, message, data)`.
- **Errors**: Always `throw ApiError.*` (never call `res.status().json()` directly for errors).
- **Error JSON format**:
  ```json
  {
    "status": "fail",
    "code": "BAD_REQUEST",
    "message": "Human-readable message",
    "requestId": "12345678-1234-...",
    "errors": [ ... ]
  }
  ```
- **Error handling rule**: Clients must branch on the stable `code` string (e.g. `UNAUTHENTICATED`, `FORBIDDEN`, `USER_BANNED`, `INVALID_OR_EXPIRED_TOKEN`, `VALIDATION_ERROR`), not on the `message` string.

## Development

```bash
# Start backend in watch mode
bun run dev
```
