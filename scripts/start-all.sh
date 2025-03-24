#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Supabase and Next.js application...${NC}"

# Start Docker if not running
if ! docker info > /dev/null 2>&1; then
  echo -e "${YELLOW}Docker is not running. Starting Docker...${NC}"
  open -a Docker
  echo -e "${YELLOW}Waiting for Docker to start...${NC}"
  sleep 10
fi

# Check if Supabase is running
echo -e "${YELLOW}Checking Supabase status...${NC}"
if supabase status 2>/dev/null | grep -q "local development setup is running"; then
  echo -e "${GREEN}Supabase is already running.${NC}"
else
  echo -e "${YELLOW}Starting Supabase...${NC}"
  supabase start
  
  # Check if Supabase started successfully
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start Supabase. Trying to stop and restart...${NC}"
    supabase stop && supabase start
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Error: Could not start Supabase. Exiting.${NC}"
      exit 1
    fi
  fi
  
  echo -e "${GREEN}Supabase started successfully.${NC}"
fi

# Setting up environment variables
echo -e "${YELLOW}Setting up environment variables...${NC}"
node setup-env.js

# Reset the database to ensure it has the right schema and seed data
echo -e "${YELLOW}Resetting the database...${NC}"
supabase db reset

echo -e "${YELLOW}Checking if port 3004 is in use...${NC}"
# Check if port 3004 is in use
if lsof -i :3004 > /dev/null; then
  echo -e "${YELLOW}Port 3004 is in use. Killing the process...${NC}"
  lsof -ti :3004 | xargs kill -9
  sleep 1
fi

# Start Next.js application
echo -e "${GREEN}Starting Next.js application on port 3004...${NC}"
echo -e "${YELLOW}Login credentials: demo@example.com / password123${NC}"
echo -e "${YELLOW}Application will be available at: http://localhost:3004${NC}"
npm run dev 