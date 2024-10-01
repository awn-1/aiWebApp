FROM node:18

WORKDIR /usr/src/app

# Copy package.json files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy project files
COPY frontend ./frontend
COPY backend ./backend
RUN pwd
RUN ls
# Build frontend
RUN cd frontend && npm run build

# Set working directory to backend
WORKDIR /usr/src/app/backend

# Start the application
CMD ["npm", "start"]