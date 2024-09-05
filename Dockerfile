FROM node:latest


# The /app directory should act as the main application directory
WORKDIR /usr/src/app

# Copy the app package and package-lock.json file
COPY package*.json ./

# Copy local directories to the current local directory of our docker image (/app)
COPY ./src ./src
COPY ./keys ./keys
COPY ./.env ./
COPY jest.config.js ./
COPY tsconfig.json ./

# Install node packages
RUN yarn

# Expose the port the app runs on
EXPOSE 3000

# Run the app with yarn commands
CMD ["sh", "-c", "yarn && yarn start"]
