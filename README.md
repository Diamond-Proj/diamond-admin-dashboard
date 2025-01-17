# Diamond Admin Dashboard

## Overview

Diamond Admin Dashboard is a comprehensive admin interface built with Next.js, featuring a modern UI with Tailwind CSS and TypeScript. It is designed for managing jobs, users, and settings within a secure environment. This repository contains the frontend application only.

## Installation Instructions

### Prerequisites

- Node.js
- pnpm (Package manager)

### Setting Up the Project

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Diamond-Proj/diamond-admin-dashboard
   cd diamond-admin-dashboard
   ```

2. **Install Node dependencies:**

   ```bash
   pnpm install
   ```

3. **Environment Configuration:**

   - Copy the `.env.example` file to `.env` and adjust the configuration to match your local setup.
   - Ensure the backend API URL is correctly configured in your environment variables.

4. **Running the Development Server:**

   ```bash
   nvm use 22
   pnpm run next-dev
   ```

5. **Access the Application:**
   - Open your web browser and navigate to `http://localhost:3000` to view the dashboard.

## Deployment
The application uses automated deployment through Coolify:

1. **Development Deployments:**
   - Every Pull Request automatically gets a preview deployment
   - Preview deployments can be accessed through the PR status checks

2. **Production Deployment:**
   - Merging to `main` branch automatically triggers production deployment
   - Production site is available at `https://diamondhpc.ai`

3. **Monitoring:**
   - Deployment status can be monitored in the PR checks
   - Coolify dashboard shows detailed deployment logs and status

4. **Troubleshooting:**
   If you encounter issues:
   - Check PR status checks for deployment failures
   - Review Coolify dashboard for detailed logs
   - Contact system administrator if issues persist

## Additional Information

- This repository contains only the frontend application. The backend services are maintained in a separate repository.
- Ensure all environment variables and configurations are set correctly in the `.env` file.

<br>

Copyright (c) 2024 University of Illinois and others. All rights reserved.

This program and the accompanying materials are made available under the
terms of the Mozilla Public License v2.0 which accompanies this distribution,
and is available at https://www.mozilla.org/en-US/MPL/2.0/
