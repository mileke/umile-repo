# Stage 1: Build the React SPA
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy dependency files and install packages
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the Vite application (outputs to /app/dist)
RUN npm run build

# Stage 2: Serve the application
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install 'serve' globally to handle static files and SPA routing
RUN npm install -g serve

# Copy the compiled build from the builder stage
COPY --from=builder /app/dist ./dist

# Google Cloud Run injects the PORT environment variable.
# We set a default of 8080 (Cloud Run's default) just in case.
ENV PORT=8080
EXPOSE 8080

# Run 'serve' in SPA mode (-s) which redirects all 404s to index.html.
CMD ["sh", "-c", "serve -s dist -l $PORT"]
