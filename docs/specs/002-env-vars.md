# 002 - Environment Configuration

## Purpose

Define a strict, repeatable way to load, validate, and consume environment variables in the API with **no implicit defaults** and a single authoritative schema.

## Approach

- **Single source of truth**: all env access goes through NestJS `ConfigService`.
- **Source of truth**: the validation schema defines the complete set of required variables.
- **Fail fast**: missing or invalid values prevent the API from starting.
- **No implicit defaults**: every value must be explicit in the environment.
- **Predictable override order**: runtime env overrides `.env` values.

## Loading Rules

- The API loads a root `.env` file for local development.
- Runtime environment variables always take precedence.
- The config module is global so all modules can consume config consistently.

## Validation Rules

- Every variable is validated at startup using a schema.
- All declared variables are required.
- URLs and ports are validated for shape and correctness.
- Missing values halt startup immediately.

## Consumption Rules

- Do **not** read `process.env` directly in services or controllers.
- Add new env vars to the validation schema when introduced.
- Consume values via `ConfigService` in modules that need them.

## Change Guidance

- If a variable is required for correctness or security, enforce it in validation.
- Keep the schema in sync with `.env.example` so the required set stays explicit.
- Avoid hidden fallbacks; keep configuration explicit and deterministic.
