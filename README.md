# Diamond Admin Dashboard

## Overview

Diamond Admin Dashboard is a comprehensive admin interface built with Next.js and Flask, integrating SQLite for database management. It features a modern UI with Tailwind CSS and TypeScript, and is designed for managing jobs, users, and settings within a secure environment.

## Installation Instructions

### Prerequisites

- Node.js
- Python 3
- pnpm (Package manager)

### Setting Up the Project

1. **Clone the repository:**

   ```bash
   git clone [repository-url]
   cd [repository-directory]
   ```

2. **Install Node dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up Python environment:**

   - Create a virtual environment:
     ```bash
     python -m venv venv
     ```
   - Activate the virtual environment:
     ```bash
     # For Windows
     .\venv\Scripts\activate
     # For Unix or MacOS
     source venv/bin/activate
     ```
   - Install Python dependencies:
     ```bash
     pip install -r requirements.txt
     ```

4. **Environment Configuration:**

   - Copy the `.env.example` file to `.env` and adjust the configuration to match your local setup for both backend and frontend.

5. **Running the Development Servers:**

   - Start the Flask backend:
     ```bash
     nvm use 22
     pnpm run flask-dev
     ```
   - In a new terminal, start the Next.js frontend:
     ```bash
     nvm use 22
     pnpm run next-dev
     ```

6. **Access the Application:**
   - Open your web browser and navigate to `http://localhost:3000` to view the dashboard.

## Deployment Instructions
- ssh to deployment machine 
- cd `Diamond-Proj/diamond-admin-dashboard`
- Change git branch to the deployment PR. Eg: `gh pr checkout 9`
- Build the docker-stack : `sudo docker-compose build`
- Check if `certs/acme.json` file exists with 600 permissions. `chmod 600 certs/acme.json`.
- Run the docker-stack : `sudo docker-compose up`
   - OR Run the docker-stack in background : `sudo dokcer-compose up -d`
- Test deployment at `diamond.ncsa.illinois.edu`
  
- If you ran into error `[Errno 28] No space left on device:`, try below:
    - Free more spaces by running `docker system prune --all` 
    - If in local, increase the Disk image size. You can find the configuration in Docker Desktop


## Additional Information

- Ensure all environment variables and configurations are set correctly in the `.env` file for both the backend and frontend services.

<br>

Copyright (c) 2024 University of Illinois and others. All rights reserved.

This program and the accompanying materials are made available under the
terms of the Mozilla Public License v2.0 which accompanies this distribution,
and is available at https://www.mozilla.org/en-US/MPL/2.0/
