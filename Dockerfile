# Use an official Node runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json from both frontend and backend
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies for both frontend and backend
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy the rest of the application code
COPY frontend ./frontend
COPY backend ./backend

# Build the React app
RUN cd frontend && npm run build

# Set working directory to backend
WORKDIR /usr/src/app/backend

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the app
CMD ["npm", "start"]