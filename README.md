# Nugu

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com)
- [pnpm](https://pnpm.io)

### Installation

1. **Set up environment variables**

   Copy the example environment file and if necessary, modify it according to
   your local environment settings.

   ```sh
   cp .env.example .env
   ```

2. **Install dependencies**

   Use pnpm to install all necessary dependencies.

   ```sh
   pnpm install
   ```

3. **Setup database**

   Start the database using Docker.

   ```sh
   docker run \
   --name mysql \
   -p 3306:3306 \
   --env MYSQL_ROOT_PASSWORD=password \
   --env MYSQL_DATABASE=nugu \
   --detach mysql:8.4 \
   --character-set-server=utf8mb4 \
   --collation-server=utf8mb4_unicode_ci \
   ```

   Run database migrations to set up the required database schema.

   ```sh
   pnpm db:migrate
   ```

4. **Run the application**

   To start the application in development mode, use the following command:

   ```sh
   pnpm dev
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
