#!/bin/bash

# Define the port
PORT=3004

# Check if the port is in use
if lsof -i :$PORT > /dev/null ; then
  echo "Port $PORT is in use. Killing the process..."
  lsof -ti :$PORT | xargs kill -9
  sleep 1
fi

# Start the development server
echo "Starting server on port $PORT..."
npm run dev 