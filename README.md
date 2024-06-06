# jwt-auth-service

This is a simple authentication service built with Node.js and Express. The service provides endpoints for user authentication and posts retrieval with token-based authentication.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [License](#license)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/auth-service.git
   cd auth-service
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a .env file in the root directory and add your environment variables (see Environment Variables).

4. Start server:
   ```sh
   npm start
   ```

## Usage

After starting the server, you can use an API client like Postman to interact with the endpoints.

## Project Structure

```bash
project-root/
│
├── controllers/
│   ├── authController.js
│   └── postsController.js
│
├── middleware/
│   ├── authenticateToken.js
│   ├── assignId.js
│   ├── logger.js
│
├── models/
│   └── users.js
│
├── routes/
│   ├── authRoutes.js
│   ├── postsRoutes.js
│
├── utils/
│   ├── fileUtils.js
│
├── .env
├── app.js
└── package.json
```

Controllers:

    1. authController.js: Handles authentication-related logic.
    2. postsController.js: Handles posts-related logic.

Middleware:

    1. authenticateToken.js: Middleware to authenticate tokens.
    2. assignId.js: Middleware to assign a unique ID to each request.
    3. logger.js: Middleware for logging requests.

Models:

    1. users.js: Handles loading and saving users.

Routes:

    1. authRoutes.js: Defines authentication-related routes.
    2. postsRoutes.js: Defines posts-related routes.

## API Endpoints

Authentication

- Logout: DELETE /auth/logout
  - Body: { "token": "your_refresh_token" }
  - Description: Logs out the user by removing the refresh token.

Posts

- Get Posts: GET /posts
  - Headers: Authorization: Bearer <access_token>
  - Description: Retrieves posts for the authenticated user.

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```sh
PORT=5000
ACCESS_TOKEN_SECRET_KEY=your_secret_key
REFRESH_TOKEN_SECRET_KEY=your_another_secret_key
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

### How to Use the `README.md` File

1. **Replace `yourusername`** with your actual GitHub username in the clone command.
2. **Adjust Project Details**: Modify any project-specific details, such as additional endpoints or usage instructions.
3. **Environment Variables**: Ensure the `.env` file section matches the environment variables used in your project.

This `README.md` file provides a comprehensive overview of your project, guiding users through installation, usage, and understanding the project's structure.
In VsCode press `Ctrl + Shift + v` to view the `README.md` file.
