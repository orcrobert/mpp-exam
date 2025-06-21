# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install --production

# Copy the rest of the application's source code from your project to the working directory
COPY . .

# Build TypeScript code
RUN npm run build

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define the command to run your app
CMD [ "npm", "start" ] 