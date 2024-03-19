# Hand Duel API

## Functional Requirements

- [ ] The system should allow users to register a new account;
- [ ] Users should be able to authenticate using their credentials;
- [ ] It should provide functionality to get the authenticated user's profile;
- [ ] Users should be able to create a new game session;
- [ ] The system should display a list of games associated with the user;
- [ ] Users should be able to join game sessions created by other users;
- [ ] It should support searching for games by game ID;
- [ ] Users should be able to search for games by the game session owner's nickname;
- [ ] The system should display a list of all open game sessions;
- [ ] It should support real-time communication between players during a game session;
- [ ] Users should be able to choose their move (rock, paper, or scissors) within a specified time limit.
- [ ] The system should determine and display the winner of each game based on the moves made by both players;
- [ ] It should provide an option for users to rematch after completing a game;
- [ ] Users should have the ability to view their game history, including past matches and outcomes

## Non-Functional Requirements

- [ ] The system should handle multiple concurrent game sessions efficiently without significant delays;
- [ ] User passwords should be securely encrypted;
- [ ] Application data should be persisted in a MySQL database;
- [ ] Users should be identified using JWT (JSON Web Tokens);

## Business Rules

- [ ] Users cannot register a new account with a duplicated email address;
- [ ] Users cannot participate in more than one game session simultaneously;
- [ ] Game sessions will be automatically closed after 10 minutes of inactivity;
