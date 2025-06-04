# 😂 Memzy: Your Personalized Humor Hub
![Alt text for the image](images/memzyiconcopyyy.jpg)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![.NET Core](https://img.shields.io/badge/.NET%20Core-512BD4?style=for-the-badge&logo=dot-net&logoColor=white)](https://dotnet.microsoft.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/en-us/sql-server/)

Memzy is a vibrant, full-stack web application designed for meme enthusiasts who crave a fun, customizable, and engaging sharing experience. Built with the powerful combination of **Next.js** for a blazing-fast frontend and **.NET Core** for a robust backend, Memzy empowers users to personalize their humor preferences, manage their profiles, and connect with a modern social platform that boasts real-time features and a truly responsive UI.

Get ready to dive into a world of laughter tailored just for you!

---

## 📚 Table of Contents

- ✨ [Key Features](#-key-features)
- 🚀 [Live Demo & Screenshots](#-live-demo--screenshots)
- 🧰 [Tech Stack](#-tech-stack)
- 🎬 [Getting Started](#-getting-started)
  - 📦 [Backend Setup](#-backend-setup)
  - 💻 [Frontend Setup](#-frontend-setup)
- 🔐 [Environment Variables](#-environment-variables)
- 📁 [Project Structure](#-project-structure)
- 📡 [API Endpoints](#-api-endpoints)
- 🤝 [Contributing](#-contributing)
- 📝 [License](#-license)

---

## ✨ Key Features

Memzy offers a rich set of features designed to enhance your meme-sharing journey:

-   🔒 **Secure Authentication**: Robust JWT-based authentication for seamless user login and registration.
-   🧑‍🎨 **Personalized Profiles**: Customize your presence with editable names, bios, and profile pictures.
-   😂 **Tailored Humor Preferences**: Fine-tune your content feed by selecting humor types (e.g., Dark, Friendly) to see more of what you love.
-   🔄 **Effortless Password Management**: Secure and straightforward options for updating your password.
-   💬 **Real-time Engagement**: Experience dynamic interactions with real-time messaging powered by WebSockets, bringing conversations to life.
-   📱 **Adaptive & Responsive UI**: Enjoy a consistent and beautiful experience across all devices, thanks to a mobile-first design implemented with Tailwind CSS.
-   ⚙️ **Clean RESTful API**: A meticulously designed, modular, and scalable backend architecture following REST principles.
-   📐 **SOLID Principles**: Adherence to SOLID principles ensures a maintainable, extensible, and robust codebase.

---

## 🚀 Live Demo & Screenshots

*(If you have a live demo, link it here!)*
Check out Memzy in action: [Link to your live demo (if available)]

*(Add screenshots here to showcase your application's UI. This is highly recommended!)*
![Screenshot 1 Description](images/Screeny1.png)
*A captivating screenshot of the Memzy home feed.*
![Screenshot 2 Description](images/2e2deqwdqad.png)
*Another screenshot showing profile customization.*

---

## 🧰 Tech Stack

Memzy is built with a modern and powerful tech stack to ensure performance, scalability, and an excellent developer experience.

### Frontend

-   **[Next.js](https://nextjs.org/)**: A React framework for production, providing server-side rendering and static site generation.
-   **[React](https://react.dev/)**: A declarative, efficient, and flexible JavaScript library for building user interfaces.
-   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapidly building custom designs.
-   **[Headless UI](https://headlessui.dev/)**: Completely unstyled, fully accessible UI components, designed to integrate beautifully with Tailwind CSS.

### Backend

-   **[.NET Core Web API](https://dotnet.microsoft.com/)**: A cross-platform, high-performance framework for building modern, cloud-based, internet-connected applications.
-   **[Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)**: A modern object-database mapper for .NET, enabling developers to work with a database using .NET objects.
-   **SQL Server**: The default relational database management system, though easily configurable for other RDBMS (e.g., PostgreSQL, MySQL).

---

## 🎬 Getting Started

Follow these instructions to set up and run Memzy on your local machine.

### 📦 Backend Setup

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/yourusername/memzy_finalist.git](https://github.com/yourusername/memzy_finalist.git)
    cd memzy_finalist/backend
    ```

2.  **Restore NuGet packages:**

    ```bash
    dotnet restore
    ```

3.  **Configure your database connection string:**
    Open `appsettings.json` (or `appsettings.Development.json`) and update the `ConnectionStrings:DefaultConnection` with your SQL Server details.

    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Server=your_server;Database=MemzyDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
      },
      // ... other settings
    }
    ```
    *Note: For production, consider using environment variables for sensitive information.*

4.  **Apply database migrations:**

    ```bash
    dotnet ef database update
    ```

5.  **Run the backend application:**

    ```bash
    dotnet run
    ```
    The backend API will typically run on `https://localhost:7000` (or a similar port). Check the console output for the exact URL.

### 💻 Frontend Setup

1.  **Navigate to the frontend directory:**

    ```bash
    cd ../frontend # Assuming you are in the 'backend' directory
    ```
    Or, if starting from the root:
    ```bash
    cd memzy_finalist/frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install # or yarn install
    ```

3.  **Configure environment variables:**
    Create a `.env.local` file in the `frontend` directory and add your backend API URL.

    ```dotenv
    NEXT_PUBLIC_API_BASE_URL=http://localhost:7000/api # Adjust if your backend runs on a different port/protocol
    ```

4.  **Run the frontend application:**

    ```bash
    npm run dev # or yarn dev
    ```
    The frontend will typically run on `http://localhost:3000`.

You should now be able to access Memzy in your browser!

---

## 🔐 Environment Variables

To ensure proper functionality, set up the following environment variables:

### Backend (`backend/appsettings.json` or environment variables)

-   `ConnectionStrings:DefaultConnection`: Your database connection string.
-   `Jwt:Key`: A strong, secret key for JWT token generation.
-   `Jwt:Issuer`: The issuer of the JWT tokens.
-   `Jwt:Audience`: The audience for the JWT tokens.

### Frontend (`frontend/.env.local`)

-   `NEXT_PUBLIC_API_BASE_URL`: The base URL of your .NET Core API (e.g., `http://localhost:7000/api`).

---

## 📁 Project Structure