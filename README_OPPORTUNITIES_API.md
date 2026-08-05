# CampusConnect Internal Opportunities API

This document describes how to securely publish opportunities from backend services (such as `opportunities.auto`) to the CampusConnect platform.

## Endpoint

**`POST /api/internal/opportunities`**

This endpoint accepts a JSON payload to create or update an opportunity (mapped to the `Internship` table). It uses an `externalId` to prevent duplicates—if an opportunity with the given `externalId` already exists, it will be updated; otherwise, it will be created.

## Authentication

All requests to this internal API must include the `x-internal-key` header matching the `INTERNAL_API_KEY` defined in the server's environment.

**Required Header:**
```
x-internal-key: <YOUR_INTERNAL_API_KEY>
```

> **Security Note**: Never expose the `INTERNAL_API_KEY` in frontend code (e.g. do not prefix it with `NEXT_PUBLIC_`). Keep it strictly on backend services.

## Request Payload

The request body must be a JSON object with the following fields:

### Required Fields
- `externalId` (String): A unique identifier from the source (e.g., `unstop-1234`). Used to prevent duplicates.
- `source` (String): The source of the opportunity (e.g., `Unstop`, `AICTE`, `Internshala`).
- `title` (String): Job/Internship title (minimum 3 characters).
- `description` (String): Detailed description (minimum 10 characters).
- `company` (String): Name of the hiring company.

### Optional Fields
- `skills` (String, nullable): Comma-separated skills required.
- `stipend` (Number, nullable): Stipend amount or salary.
- `duration` (String, nullable): Duration (e.g., `6 Months`).
- `location` (String, nullable): Location (e.g., `Remote`, `Bangalore`).
- `deadline` (String, nullable): Application deadline in ISO 8601 format (e.g., `2024-12-31T23:59:59.000Z`).
- `status` (String): The status of the job (defaults to `OPEN`).
- `applicationLink` (String, nullable): A valid URL to apply for the job.
- `tags` (String, nullable): Comma-separated tags (e.g., `Tech, Full-Time`).

### Example Request

```json
{
  "externalId": "internshala-7890",
  "source": "Internshala",
  "title": "Software Engineering Intern",
  "description": "Join our fast-paced startup to build scalable Next.js applications.",
  "company": "TechNova Solutions",
  "skills": "React, Next.js, Node.js",
  "stipend": 25000,
  "duration": "3 Months",
  "location": "Remote",
  "deadline": "2024-05-30T12:00:00Z",
  "applicationLink": "https://internshala.com/internships/technova-123",
  "tags": "engineering, frontend"
}
```

## Responses

### Success

**`201 Created`**
Returned when a new opportunity is successfully created.
```json
{
  "message": "Opportunity created successfully",
  "id": "uuid-of-created-record"
}
```

**`200 OK`**
Returned when an existing opportunity is successfully updated.
```json
{
  "message": "Opportunity updated successfully",
  "id": "uuid-of-updated-record"
}
```

### Errors

**`400 Bad Request` (Malformed Payload or Validation Error)**
Returned when the JSON is invalid or fails Zod validation. The response includes details about missing or invalid fields.
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "minimum": 3,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "title must be at least 3 characters",
      "path": ["title"]
    }
  ]
}
```
*Note: The API limits payloads to 100KB to prevent memory exhaustion.*

**`401 Unauthorized`**
Returned when the `x-internal-key` is missing or incorrect.
```json
{
  "error": "Unauthorized"
}
```

**`429 Too Many Requests`**
Returned when the rate limit (60 requests per minute per IP) is exceeded.
```json
{
  "error": "Rate limit exceeded"
}
```

**`500 Internal Server Error`**
Returned for unexpected server-side failures (database issues, etc). Stack traces are explicitly suppressed for security.
```json
{
  "error": "Internal Server Error"
}
```
