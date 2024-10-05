# Step 1: Build the frontend (React) app
FROM node:18 AS frontend-build

# Set the working directory for the frontend
WORKDIR /usr/src/app/frontend

# Copy package.json and package-lock.json for the frontend
COPY frontend/package*.json ./

# Install dependencies for the frontend
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/ .

# Build the React app for production
RUN npm run build

# Step 2: Set up the backend (Node.js) server
FROM node:18 AS backend

# Set the working directory for the backend
WORKDIR /usr/src/app/backend

# Copy package.json and package-lock.json for the backend
COPY backend/package*.json ./

# Install dependencies for the backend
RUN npm install

# Copy the rest of the backend source code
COPY backend/ .

# Copy the built frontend files to the backend's public directory
COPY --from=frontend-build /usr/src/app/frontend/build /usr/src/app/backend/public

# Expose the port that the backend will run on
EXPOSE 8081

# Start the backend server
CMD ["node", "server.js"]