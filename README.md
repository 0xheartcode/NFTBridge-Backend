# Backend Boilerplate with Express Typescript CI/CD Yarn v4 Project

Welcome to the Blank Boilerplate Backend project. BBB. 

This project is a Typescript Express application utilizing dbSqlite as a database. Support for other databases will be coming. Configured to use Yarn v4 as the package manager. It does use Github CI/CD.

It features basic API endpoints to help you get started.

## Table of Contents

- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)

## Installation

To install the dependencies for this project, run:

```bash
yarn install
```
## API Endpoints

### Basic Operations
- `GET /basic/getPing`: Basic ping (unrestricted)
- `GET /basic/getSafePing`: Authenticated ping
- `POST /basic/setBearerToken`: Set new bearer token
- `GET /basic/getCurrentToken`: Get current bearer token
- `POST /basic/changeBearerToken`: Change bearer token

Note: Most endpoints require authentication with a bearer token.


## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode. Open [http://localhost:8080](http://localhost:8080) to view it in your browser.

### `yarn dev`

Runs the app in continious development mode and watches for file changes.

### `yarn build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `yarn test`

Launches the test runner in the interactive watch mode.

### `yarn eject`

This command will remove the single build dependency from your project. **Note: this is a one-way operation. Once you \`eject\`, you can’t go back!**

### `yarn serve`

Serves the production build of the app using a static server.

## Project Structure

```
.
├── Makefile
├── package.json
├── README.md
├── src
│   ├── app.ts
│   ├── dbcode
│   │   ├── dbClient.ts
│   │   └── dbSetup.ts
│   ├── handlers
│   │   └── basicHandler.ts
│   ├── helpers
│   ├── middleware
│   │   └── auth.ts
│   ├── routes.ts
│   └── types
│       └── dbInterfaces.ts
├── tsconfig.json
├── utils
│   ├── db
│   │   └── database.db
│   ├── dockerfiles
│   │   ├── docker-compose.yml
│   │   └── Dockerfile.standard
│   └── nginx
│       └── nginx.conf
└── yarn.lock
```

### CI/CD Process

This project uses GitHub Actions for Continuous Integration and Continuous Deployment. The branches below may be present partially or completely.

- **Production Branch**: Code pushed to the `prod` branch will trigger the CI/CD pipeline, which will build and deploy the application to the production environment.
- **Staging Branch**: Code pushed to the `staging` branch will trigger the CI/CD pipeline, which will build and deploy the application to the staging environment.
- **Development Branch**: The `dev` branch is used for development purposes and does not trigger any CI/CD pipeline.

The CI/CD process is defined in the `.github/workflows` directory and includes steps such as checking out the repository, setting up Node.js, installing dependencies, building the project, creating a Docker image, and deploying it to the server.

**Environment Variables (GitHub Secrets and Variables)**:
- `ENVKEY_PORT`: Port number for the application 				(needed) [VAR]
- `INITIAL_BEARER_TOKEN`: Initial bearer token for authentication [VAR]
- `MAKEFILE_OVERWRITE_DOCKERNAME`: Docker name override [VAR]
- `MONGO_URI` : Port number for the application 				(needed) [SECRET]
- `REMOTE_HOST_TESTNET`: Staging server hostname 				(needed) [SECRET]
- `REMOTE_HOST_STAGING`: Staging server hostname 				(needed) [SECRET]
- `REMOTE_HOST_PROD`: Production server hostname 				(needed) [SECRET]
- `REMOTE_USERNAME`: SSH username for staging server 		(needed) [SECRET]
- `SSH_PRIVATE_KEY`: SSH private key for server access 	(needed) [SECRET]
- `REMOTE_PORT`: SSH port for staging server 						(needed) [SECRET]

- `OWNER_PRIVATEKEY`: Privatekey of the owner, to execute web3 calls. => `PRIVATEKEY` in .env file (needed) [SECRET]
## Contributing
- `ETH_RPC`: RPC for the Ethereum network [SECRET]
- `NETWORK_RPC`: RPC for the Network network [SECRET]

Open to PRs ☕😺


Happy coding <(0_0)
