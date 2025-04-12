# Decision Log

*   **[YYYY-MM-DD HH:MM:SS] - Initial Architecture:** Decided on a monolithic structure with separate Frontend (Next.js) and Backend (Node.js/Express) components. Data storage will use a simple JSON file (`database.json`) for this initial phase. Basic mock authentication will be implemented.
    *   **Rationale:** Meets project requirements for a mini-app while keeping complexity low. Allows for clear separation of concerns. Flat file storage avoids DB setup overhead for this scope.
    *   **Implications:** Scalability is limited by flat-file storage. Authentication is not secure for production.

*   **[YYYY-MM-DD HH:MM:SS] - Memory Bank Creation:** Decided to create the standard Memory Bank structure (`productContext.md`, `activeContext.md`, `systemPatterns.md`, `decisionLog.md`, `progress.md`) to maintain context.
    *   **Rationale:** Improves context persistence and collaboration across sessions/modes.
    *   **Implications:** Requires maintaining these files throughout the project lifecycle.

*   [2025-04-12 14:14:41] - Frontend Session Persistence: Implemented session persistence using `localStorage` in `AuthContext.tsx`.
    *   **Rationale:** Prevents users from being logged out on page refresh, improving user experience.
    *   **Implications:** User session data (ID, name, email, role) is stored client-side. Still relies on basic backend authentication logic.