# @mydietitian/auth

Shared authentication module configuring Better Auth with PostgreSQL (via `@mydietitian/db` Prisma adapter), Admin plugin, Expo mobile client plugin, and custom security hooks.

## Exports

### 1. `@mydietitian/auth/auth`

- `auth`: The initialized Better Auth instance.
- `Auth`: Type export (`typeof auth`).

### 2. `@mydietitian/auth/roles`

- `ROLES`: Object constant with `USER: 'user'`, `ADMIN: 'admin'`.
- `Role`: Union type of roles (`'user' | 'admin'`).
- `isAdmin(role)`: Helper function.

### 3. `@mydietitian/auth/password-policy`

- `passwordSchema`: Zod schema enforcing:
  - Length: 8 to 72 characters
  - At least one uppercase letter (`[A-Z]`)
  - At least one lowercase letter (`[a-z]`)
  - At least one number (`[0-9]`)
  - At least one special character (`[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]`)
- `validatePassword(password)`: Utility function returning `{ isValid, error }`.
- Password policy is enforced via Better Auth `hooks.before` middleware on `/sign-up/email` and `/reset-password` to prevent policy bypasses.

## Environment Variables

- `BETTER_AUTH_URL`: Canonical URL of the auth server (e.g. `http://localhost:7000`).
- `BETTER_AUTH_SECRET`: Secret key for session encryption and signing.
- `MOBILE_SCHEME`: Deep linking scheme for mobile client (e.g. `mydietitian://`).
- `ADMIN_URL`: URL of the web admin client (e.g. `http://localhost:3000`).
- `REQUIRE_EMAIL_VERIFICATION`: `true` / `false` (default: `false`).
