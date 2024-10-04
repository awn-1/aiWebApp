FROM node:18
WORKDIR /usr/src/app

# edit to force steps rather than use cache
RUN ls


# Copy package.json files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy source files
COPY frontend ./frontend
COPY backend ./backend

# Build frontend
RUN cd frontend && npm run build

# Set working directory to backend
WORKDIR /usr/src/app/backend

EXPOSE 3001
CMD ["node", "server.js"]