# Peer-to-Peer Book Exchange Portal - Architecture

## 1. High-Level Overview

A standard client-server architecture:

*   **Client (Frontend):** React/Next.js application running in the user's browser. Handles UI, user interaction, and makes API calls to the backend. Deployed potentially on Vercel.
*   **Server (Backend):** Node.js/Express application. Handles business logic, authentication (mock), data storage (JSON file), and exposes a RESTful API. Deployed potentially on Render/Railway.

```mermaid
graph TD
    subgraph Frontend (React/Next.js on Vercel)
        F_UI[User Interface: Pages & Components]
        F_State[State Management: AuthContext]
        F_API[API Client: Fetch/Axios]
    end

    subgraph Backend (Node.js/Express on Render/Railway)
        B_API[REST API Endpoints: /api/auth, /api/books]
        B_Logic[Business Logic: Controllers/Handlers]
        B_Data[Data Access: Read/Write database.json]
        B_Store[Storage: database.json]
    end

    User[User Browser] --> F_UI
    F_UI --> F_State
    F_UI --> F_API
    F_API <-.-> B_API
    B_API --> B_Logic
    B_Logic --> B_Data
    B_Data <--> B_Store
```

## 2. Component Breakdown

### Frontend (`frontend/`)

*   **`pages/` or `app/` (using App Router):** Next.js page routes.
    *   `/`: Home page (potentially shows book listings).
    *   `/login`: Login page.
    *   `/register`: Registration page.
    *   `/dashboard`: User-specific dashboard (redirects based on role).
    *   `/add-book`: Form for Owners to add books.
    *   `/books`: Browse all books page.
    *   `/books/[id]`: View details of a specific book.
*   **`components/`:** Reusable UI elements.
    *   `AuthForm.tsx`: Handles login/registration forms.
    *   `BookList.tsx`: Displays a list of books.
    *   `BookCard.tsx`: Individual book display card.
    *   `AddBookForm.tsx`: Form for adding/editing books.
    *   `Navbar.tsx`: Site navigation.
    *   `FilterSort.tsx`: UI for filtering/sorting books (Optional).
*   **`context/`:** React Context for global state.
    *   `AuthContext.tsx`: Manages user authentication state and user info.
*   **`lib/` or `utils/`:** Helper functions, API call wrappers.

### Backend (`backend/`)

*   **`index.js`:** Main server file (Express app setup, middleware registration, route mounting).
*   **`routes/` (Optional):** Route definitions.
    *   `auth.js`: Handles `/api/auth/*` routes.
    *   `books.js`: Handles `/api/books/*` routes.
*   **`controllers/` (Optional):** Business logic for request handling.
    *   `userController.js`: Logic for user registration, login.
    *   `bookController.js`: Logic for book CRUD operations.
*   **`models/` or `data/`:** Data access layer.
    *   Functions to read from and write to `database.json`.
*   **`middleware/` (Optional):** Custom middleware (e.g., basic auth check).
*   **`database.json`:** Flat file database.
    ```json
    {
      "users": [],
      "books": []
    }
    ```

## 3. Data Models

*   **User:**
    ```typescript
    interface User {
      id: string; // UUID
      name: string;
      mobile: string;
      email: string;
      password: string; // Plain text as per requirement
      role: 'Owner' | 'Seeker';
    }
    ```
*   **Book:**
    ```typescript
    interface Book {
      id: string; // UUID
      title: string;
      author: string;
      genre?: string;
      location: string;
      contact: string; // Email or Phone from User profile
      ownerId: string; // ID of the User who owns the book
      status: 'Available' | 'Rented/Exchanged';
    }
    ```

## 4. API Endpoints (RESTful)

Base URL: `/api`

*   **Authentication (`/auth`)**
    *   `POST /register`: Creates a new user.
        *   Request Body: `{ name, mobile, email, password, role }`
        *   Response: `{ user: User }` or error.
    *   `POST /login`: Authenticates a user.
        *   Request Body: `{ email, password }`
        *   Response: `{ user: { id, name, email, role } }` or `401 Unauthorized`.
*   **Books (`/books`)**
    *   `GET /`: Retrieves all book listings.
        *   Query Params (Optional): `?title=...`, `?location=...`, `?genre=...`
        *   Response: `{ books: Book[] }`.
    *   `POST /`: Adds a new book listing. (Requires Owner role - basic check).
        *   Request Body: `{ title, author, genre, location, contact, ownerId }` (ownerId likely inferred from mock auth state).
        *   Response: `{ book: Book }` or error.
    *   `GET /{id}`: Retrieves details for a specific book.
        *   Response: `{ book: Book }` or `404 Not Found`.
    *   `PATCH /{id}/status`: Updates the status of a book. (Requires Owner role - basic check on `ownerId`).
        *   Request Body: `{ status: 'Available' | 'Rented/Exchanged' }`
        *   Response: `{ book: Book }` or error.
    *   `PUT /{id}` (Bonus): Edits book details. (Requires Owner role - basic check on `ownerId`).
        *   Request Body: `{ title, author, genre, location, contact }`
        *   Response: `{ book: Book }` or error.
    *   `DELETE /{id}` (Bonus): Deletes a book listing. (Requires Owner role - basic check on `ownerId`).
        *   Response: `204 No Content` or error.

## 5. Data Flow Example: User Login

1.  **Frontend:** User submits email/password via `AuthForm` component on the `/login` page.
2.  **Frontend:** `AuthForm` calls an API utility function (e.g., `loginUser(email, password)`).
3.  **Frontend:** API utility sends a `POST` request to `/api/auth/login` with the credentials in the body.
4.  **Backend:** The `/api/auth/login` route handler in `routes/auth.js` (or `index.js`) receives the request.
5.  **Backend:** The handler calls a function (e.g., `authenticateUser` in `controllers/userController.js` or directly in the handler).
6.  **Backend:** The `authenticateUser` function reads the `users` array from `database.json` (using data access functions).
7.  **Backend:** It finds a user matching the provided `email`.
8.  **Backend:** If found, it compares the provided `password` with the stored (plain text) password.
9.  **Backend:**
    *   If match: Sends a `200 OK` response with `{ user: { id, name, email, role } }`.
    *   If no match/user not found: Sends a `401 Unauthorized` error response.
10. **Frontend:** The API utility function receives the response.
11. **Frontend:**
    *   On success (200 OK): Updates the `AuthContext` with the user data, sets authenticated state to true, and redirects the user to their dashboard (`/dashboard`).
    *   On error (401): Displays an error message to the user on the `AuthForm`.

## 6. Security Considerations (Simplified for Project Scope)

*   **Authentication:** Mock login only. No secure password hashing or session management. **Do not use in production.**
*   **Authorization:** Basic role checks (Owner vs. Seeker) will be implemented in the backend API endpoints where necessary (e.g., adding/editing books). This might involve checking the `role` property of the (mock) authenticated user or comparing `ownerId` on book operations.
*   **Input Validation:** Basic validation should be performed on both frontend and backend to prevent malformed data (e.g., check email format, required fields).
*   **Secrets:** No secrets or API keys are involved in this basic setup.

## 7. Deployment (Optional)

*   **Frontend (Next.js):** Vercel (integrates well with Next.js).
*   **Backend (Node.js):** Render, Railway, or similar platform-as-a-service providers. Configure build and start commands. Ensure the `database.json` file is handled correctly (it might reset on deployments depending on the service unless persistent storage is configured, which is beyond the scope of simple deployment).

## Footnotes
[YYYY-MM-DD HH:MM:SS] - Initial architecture design created.