# Cue.api Project

Cue.api is a backend API built with Express and Node.js. It provides essential functionalities for the Cue platform, such as user authentication, data management, and integration with the frontend. The API uses MongoDB for data storage and includes middleware for security, validation, and error handling.
 
## Table of Contents
 
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Updating Package Versions](#updating-package-versions) 

## Getting Started

### Node.js Version

This project requires Node.js version 16.4.5. Make sure you have Node.js installed, preferably using the LTS (Long Term Support) version. You can download Node.js from [the official website](https://nodejs.org/).

#### Changing Node.js Version

If you need to change the Node.js version for this project, you can use a version manager like [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm).

1. If you don't have nvm installed, follow the instructions in the [nvm repository](https://github.com/nvm-sh/nvm#install--update-script) to install it.

   Once installed, you can install and use Node.js version 16.4.5 with the following commands:

   ```bash
   nvm install 16.4.5
   nvm use 16.4.5

Ensure that you have the appropriate permissions to install global packages and switch Node.js versions on your system.

### First Setup

To get started with this project, follow these steps:

1. Clone the repository:

   ```bash
   git clone <repository-url>

2. Install dependencies:

   ```bash
   cd project-directory
   npm install

3. Run the development server:

   ```bash
   npm run dev

Open http://localhost:3000 to view the project in your browser.

###


## Project Structure

The project structure is organized as follows: 

- **controllers**: Contains the logic for handling incoming requests and sending responses. Each controller is responsible for a specific resource (e.g., users, tasks).
- **middleware**: Holds the middleware functions for tasks like authentication, validation, rate-limiting, error handling, and more.
- **models**: Defines the MongoDB models used by Mongoose for interacting with the database.
- **public/css**: Stores static CSS files used by the frontend (if any).
- **routes**: Contains route definitions for the API endpoints. Each route file links to corresponding controller methods.
- **.gitignore**: Specifies files and directories to ignore in version control.
- **package-lock.json**: Automatically generated for any operations where npm modifies the node_modules directory.
- **package.json**: Contains metadata about the project, including dependencies, scripts, and configuration for npm.
- **server.js**: The entry point of the server. This file sets up and starts the Express server.
 
## Available Scripts

In the project directory, you can run the following scripts:

`npm run dev`: Runs the server in development mode using nodemon. This will watch for changes in your files and automatically restart the server. 

`npm start`: Runs the server in production mode. This starts the Express server as defined in server.js. 


## Deployment

Deploys are automatically trigged on merges to main and during the pull request and review process. Merges to the main branch will be automatically deployed to the production environment. (in progress..)

## Updating Package Versions

As a developer, it's essential to keep package versions up-to-date to ensure compatibility and security. To update package versions:

1. Review the package.json file to identify outdated packages and their current versions.

2. Use the following command to check for outdated packages:

   ```bash
   npm outdated

3. To update a specific package to its latest version, use the following command:

   ```bash
   npm update <package-name>

Replace <package-name> with the name of the package you want to update.

4. After updating packages, ensure that the application still runs correctly by testing it locally.

 
