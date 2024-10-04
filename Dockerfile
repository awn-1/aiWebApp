FROM node:18

WORKDIR /usr/src/app

# Copy entire project
COPY . .

# Install dependencies
RUN cd frontend && npm install
RUN cd backend && npm install

# Build frontend
RUN cd frontend && npm run build

# Set working directory to backend
WORKDIR /usr/src/app/backend

# Expose the port
EXPOSE 3001
# Start the application
CMD ["npm", "start"]

