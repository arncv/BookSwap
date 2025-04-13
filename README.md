# Peer-to-Peer Book Exchange Portal (BookSwap)

## Objective

BookSwap is a mini full-stack web application designed to connect people who want to exchange, rent, or give away books (**Book Owners**) with those looking for new reads (**Book Seekers**). It provides a simple platform for listing books and facilitating peer-to-peer connections within a community.

## Tech Stack

*   **Frontend:** React, Next.js (v15+ with App Router), TypeScript, Tailwind CSS, shadcn/ui
*   **Backend:** Node.js, Express, Multer (for file uploads)
*   **Database:** Simple JSON flat file (`backend/database.json`) for persistent data storage.
*   **Session Management:** Mock authentication with frontend user session persistence via `localStorage`.

## Features Implemented

This application includes the following core and bonus features:

*   **User Profiles & Roles:**
    *   Two distinct user roles: `Owner` (can list books) and `Seeker` (can browse).
    *   User registration with Name, Mobile Number, Email, Password (plain text), and Role selection.
    *   User data stored in `database.json`.
*   **Authentication (Mock):**
    *   Basic login functionality using Email and Password.
    *   Redirects users to a relevant dashboard upon successful login.
    *   Frontend session persistence using `localStorage` to keep users logged in across browser sessions.
*   **Book Listings:**
    *   **Adding Books:** `Owner` users can create new book listings with Title, Author, Genre (optional), Location, Contact Info, and an optional Cover Image.
    *   **Browsing Books:** All users (logged in or anonymous) can browse the list of available books.
    *   **Viewing Details:** Each book card displays Title, Author, Location, Contact Info, Status, Cover Image (if available), and Owner details (Name, Email, Mobile).
*   **Owner Actions (Bonus):**
    *   **Edit Listings:** Owners can modify the details of their own book listings.
    *   **Delete Listings:** Owners can remove their book listings. Associated cover images are also deleted from the server.
    *   **Status Toggle:** Owners can mark their books as "Available" or "Rented/Exchanged".
*   **Filtering & Searching (Bonus):**
    *   Users can filter the book list by Title, Location, and Genre in real-time.
*   **Cover Image Upload (Bonus):**
    *   Owners can upload a cover image when adding or editing a book. Images are stored in the `backend/uploads/` directory and served statically.

## Setup & Running Instructions

To run this project locally, you need Node.js and npm installed. Follow these steps:

### 1. Backend API (Node.js/Express)

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```
4.  The backend API will start, typically listening on `http://localhost:3001`.
    *   Data is stored in `backend/database.json`.
    *   Uploaded images are saved in `backend/uploads/` (created automatically).

### 2. Frontend Application (Next.js)

1.  Open a **new terminal window/tab**.
2.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  The frontend application will be accessible at `http://localhost:3000`. It is configured to communicate with the backend API at `http://localhost:3001`.

## AI Tools Used

ROO Code with Boomerand and MCP + Trae

## Current Status & Potential Improvements

The application successfully implements all core requirements and the specified bonus features. It provides a functional foundation for a peer-to-peer book exchange platform.

Potential areas for future improvement include:

*   **Enhanced Validation:** Implement more robust input validation on both frontend forms and backend API endpoints.
*   **UI/UX Refinements:** Further polish the user interface and improve the overall user experience.
*   **Security:** Replace mock authentication with a secure system (e.g., password hashing, JWT/session tokens). Implement proper backend authorization beyond basic owner checks.
*   **Database:** Migrate from the flat JSON file to a more scalable database solution (e.g., PostgreSQL, MongoDB).
*   **Testing:** Add unit and integration tests for both frontend and backend.
*   **Deployment:** Formalize deployment scripts and configurations (refer to `DEPLOYMENT.md` for basic steps).
