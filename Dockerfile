# Step 1: Build the frontend
FROM node:18 AS frontend-build
WORKDIR /usr/src/app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Step 2: Set up the backend
FROM node:18 AS backend
WORKDIR /usr/src/app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# Copy built frontend files to the backend's public directory
COPY --from=frontend-build /usr/src/app/frontend/build /usr/src/app/backend/public

# Expose the port the backend will use
EXPOSE 8081

# Start the backend server
CMD ["node", "server.js"]
