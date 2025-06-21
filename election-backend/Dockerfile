# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript code
RUN npm run build

# This command will be run by Render to start the service.
# It first runs the database migrations and then starts the production server.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

# Make port 8000 available to the world outside this container
EXPOSE 8000 