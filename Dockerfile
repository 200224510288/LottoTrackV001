FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) into the container
COPY package*.json ./

# Install production dependencies first to leverage Docker's cache mechanism
RUN npm install --production

# Copy the rest of the application code into the container
COPY . .

# Generate Prisma migrations (for production, run this manually or handle it in the entrypoint)
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose port 3001 (or 3000, based on your app's port configuration)
EXPOSE 3001

# Set the environment variable for the port in the app
ENV PORT=3001

# Start the Next.js application
CMD ["npm", "start"]
