# Spring Boot JWT Auth Project

This is a complete Spring Boot application with JWT authentication, Role-Based Access Control (RBAC), and a minimal frontend.

## Features
- **User Registration & Login** (JWT-based)
- **Role-Based Authorization** (Admin vs User)
- **Admin Dashboard**: View users, block/unblock, promote to Admin.
- **User Dashboard**: View profile.
- **Secure Endpoints**: Protected by Spring Security.

## Prerequisites
- Java 17+
- Maven 3.6+
- MySQL Database

## Setup & Run

1. **Database Setup**
   - Make sure MySQL is running on port `3306`.
   - The application will automatically create the database `jwt_auth_db` if it doesn't exist.
   - Default credentials are `root` / `root`. If yours are different, update `src/main/resources/application.properties`.

2. **Build & Run**
   Open a terminal in this directory and run:
   ```sh
   mvn spring-boot:run
   ```
   Or if you have the wrapper:
   ```sh
   ./mvnw spring-boot:run
   ```

3. **Access the App**
   - Open your browser to: `http://localhost:8080/index.html`

## API Endpoints
- `POST /auth/login`
- `POST /auth/register`
- `GET /admin/users` (Admin only)
- `PUT /admin/change-role` (Admin only)
- `PUT /admin/block-user` (Admin only)
- `GET /user/profile` (User/Admin)
- `PUT /user/update` (User/Admin)

## Project Structure
- `src/main/java`: Backend source code
- `src/main/resources/static`: Frontend (HTML/CSS/JS)
