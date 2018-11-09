# Use the base image with Open JDK 8
FROM node:8.11.3

# Copy the current directory into the Docker image
COPY . /submission-quality-api

# Set working directory for future use
WORKDIR /submission-quality-api

# Install the dependencies from package.json
RUN npm install

ENTRYPOINT npm start
