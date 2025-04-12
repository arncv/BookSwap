# System Patterns

## Frontend/Backend Separation
- **Description:** The application is divided into two distinct parts: a frontend (React/Next.js) handling user interface and interaction, and a backend (Node.js/Express) handling business logic and data persistence.
- **Rationale:** Clear separation of concerns, allows independent development and scaling. Standard pattern for web applications.

## RESTful API
- **Description:** The backend exposes its functionality through a RESTful API using standard HTTP methods (GET, POST, PUT, DELETE, PATCH) and JSON for data exchange.
- **Rationale:** Well-understood, stateless, and flexible way for frontend and backend to communicate.

## Flat File Storage
- **Description:** User and book data will be stored in a single JSON file (`database.json`) managed by the backend.
- **Rationale:** Simplicity for this mini-project, avoids database setup overhead. Not suitable for production scale or complex queries.

## Basic Authentication (Mock)
- **Description:** Simple email/password check against stored user data. Frontend uses `localStorage` to persist user session data (id, name, email, role) across page refreshes. No secure tokens or backend session management yet.
- **Rationale:** Meets the minimum requirement for distinguishing user roles and provides basic session persistence without implementing a full, complex authentication system.

## Footnotes
[YYYY-MM-DD HH:MM:SS] - Initial patterns defined based on project requirements and architecture discussion.
[2025-04-12 14:14:41] - Updated Basic Authentication pattern to include frontend localStorage persistence.