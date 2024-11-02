# Use the official Node.js LTS image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and install dependencies
COPY src/package*.json ./
RUN npm install --only=production

# Copy the source code
COPY src/ .

# Set environment variables
ENV PORT=5000

# Expose port 5000 to the outside world
EXPOSE 5000

# Run the application
CMD ["node", "app.js"]
