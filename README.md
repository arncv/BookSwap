# Peer-to-Peer Book Exchange Portal

## Objective

This application facilitates the exchange or rental of books directly between users. It connects "Book Owners" who want to list their books with "Book Seekers" looking for new reads.

## Tech Stack

*   **Frontend:** React, Next.js (App Router), TypeScript, Tailwind CSS
*   **Backend:** Node.js, Express, Multer (for file uploads)
*   **Database:** Simple JSON flat file (`backend/database.json`) for data storage.
*   **Session Management:** Frontend user sessions persisted using `localStorage`.

## Features Implemented

*   **User Profiles:** Basic registration (Name, Mobile, Email, Password, Role - Owner/Seeker).
*   **Mock User Login:** Users can log in using Email/Password.
*   **Book Listings:**
    *   Owners can add new book listings (Title, Author, Genre, Location, Contact, Cover Image).
    *   Owners can edit their existing book listings.
    *   Owners can delete their book listings.
*   **Book Browsing:** Anyone (logged in or not) can browse the available book listings.
*   **Filtering:** Books can be filtered by Title, Location, and Genre.
*   **Status Toggle:** Owners can mark their books as "Available" or "Rented/Exchanged".
*   **Cover Image Upload:** Owners can upload cover images when adding or editing books. Images are stored on the backend.
*   **Session Persistence:** Frontend user login status is maintained across browser sessions using `localStorage`.

## Setup & Running Instructions

To run this project locally, you need to set up and run both the backend and frontend services.

### Backend Setup (Node.js/Express API)

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
4.  The backend API will start, typically running at `http://localhost:3001`.
    *   It uses `database.json` within the `backend` directory for storing user and book data.
    *   Uploaded cover images are stored in the `backend/uploads/` directory (this directory will be created automatically if it doesn't exist).

### Frontend Setup (Next.js App)

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  The frontend application will be accessible at `http://localhost:3000`.
    *   The frontend is configured to connect to the backend API at `http://localhost:3001`.

## AI Tools Used

No specific AI development tools were tracked during this phase of development.

## Current Status

The core features (user registration/login, book listing/browsing) and key bonus features (edit/delete books, filtering, image uploads, status toggle) are implemented.

Future improvements could include:
*   Enhanced input validation on forms.
*   UI/UX polishing.
*   More robust backend authorization.
*   Implementation of a proper database system.
*   Deployment setup.