# WorkOS Auth Spec — Magic Link Only (MVP)

## Purpose

Provide the simplest possible authentication for the MVP by using WorkOS AuthKit with **magic link only** and a **session cookie** issued by the API.

## Scope

- Browser-based app (React client + NestJS API)
- No internal user database
- No passwords, no social login
- Registration handled implicitly by WorkOS

## Components

- **WorkOS AuthKit**: Hosted sign-in UI with magic link only
- **API (NestJS)**: Handles OAuth exchange and session issuance
- **Client (React)**: Initiates login and uses authenticated API requests

## Authentication Flow

1. User clicks **Sign in** in the client.
2. Client requests the WorkOS authorization URL from the API.
3. User enters email on WorkOS hosted page.
4. WorkOS sends a magic link to the email address.
5. User clicks the magic link and is redirected to the API callback.
6. API exchanges the authorization code for user data.
7. API issues a session cookie and redirects the user back to the client.

## Registration Behavior

Registration is **implicit**. If the email does not exist in WorkOS, a new user is created automatically when they complete the magic link flow.

## Session Strategy

- **Storage**: HTTP-only cookie
- **Type**: Signed, stateless session payload
- **Lifetime**: Short-lived, refreshed on activity
- **Logout**: API clears the cookie

### Cookie Attributes

- HttpOnly
- Secure (production only)
- SameSite=Lax
- Path=/

## API Endpoints

- **GET /api/auth/login** — Returns WorkOS authorization URL
- **GET /api/auth/callback** — Exchanges code, issues session cookie
- **GET /api/auth/me** — Returns current user from session
- **POST /api/auth/logout** — Clears session cookie

## Data Schemas

### User

| Field     | Type      | Notes          |
| --------- | --------- | -------------- |
| id        | string    | WorkOS user id |
| email     | string    | Primary email  |
| name      | string    | Display name   |
| createdAt | timestamp | From WorkOS    |
| updatedAt | timestamp | From WorkOS    |

### Session

| Field     | Type      | Notes                   |
| --------- | --------- | ----------------------- |
| sessionId | string    | Unique session id       |
| userId    | string    | WorkOS user id          |
| email     | string    | Cached for quick access |
| issuedAt  | timestamp | Session creation        |
| expiresAt | timestamp | Session expiry          |

### AuthContext

| Field           | Type    | Notes                |
| --------------- | ------- | -------------------- |
| user            | User    | Current user profile |
| isAuthenticated | boolean | Session validity     |

## Configuration

- WorkOS API key
- WorkOS client ID
- WorkOS redirect URI
- Session signing secret
- App base URL

## Security Notes

- Credentials never touch the app
- Session cookie is HTTP-only to reduce XSS exposure
- SameSite reduces CSRF risk
- WorkOS is the system of record for user identity
