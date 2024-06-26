# Hand Duel API

## Technologies

- Node.Js
- Typescript
- Fastify
- Prisma
- PostgreSQL

## Functional Requirements

- [x] The system should allow users to register a new account;
- [x] Users should be able to authenticate using their credentials;
- [x] It should provide functionality to get the authenticated user's profile;
- [x] Users should be able to create a new game session;
- [ ] The system should display a list of games associated with the user;
- [x] Users should be able to join game sessions created by other users;
- [ ] It should support searching for games by game code;
- [ ] Users should be able to search for games by the game session owner's nickname;
- [x] The system should display a list of all open game sessions;
- [x] It should support real-time communication between players during a game session;
- [ ] Users should be able to choose their move (rock, paper, or scissors) within a specified time limit.
- [x] The system should determine and display the winner of each game based on the moves made by both players;
- [ ] Users should have the ability to view their game history, including past matches and outcomes

## Non-Functional Requirements

- [x] The system should handle multiple concurrent game sessions efficiently without significant delays;
- [x] User passwords should be securely encrypted;
- [x] Application data should be persisted in a PostgreSQL database;
- [x] Users should be identified using JWT (JSON Web Tokens);

## Business Rules

- [x] Users cannot register a new account with a duplicated email address;
- [x] Users cannot participate in more than one game session simultaneously;
- [ ] Game sessions will be automatically closed after 10 minutes of inactivity;

## Install

1. Clone the repository:

    ```shell
    git clone https://github.com/joao-pedro-moreno/API-hand-duel.git
    ```

2. Enter the project directory:

    ```shell
    cd API-hand-duel
    ```

3. Install the dependencies:

    ```shell
    npm install
    # or
    yarn install
    ```

4. Clone the ``.env`` file:

    ```shell
    cp .env.example .env
  
    ```

5. Create and start database with docker:

    ```shell
    docker compose up
    ```

6. Configure Prisma ORM:

    ```shell
    npx prisma generate

    npx prisma migrate dev
    ```

7. Run the server:

    ```shell
    npm run start:dev
    ```

The API will be available on <http://localhost:3333>
