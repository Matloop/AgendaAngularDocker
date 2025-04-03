# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Set the output path explicitly if needed, though it should pick from angular.json
RUN npm run build -- --configuration production --output-path=./dist/agenda

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine
# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
# Copy the built Angular application output from the build stage to Nginx's web root
COPY --from=build /app/dist/agenda /usr/share/nginx/html

# Expose port 80 (standard HTTP port Nginx listens on)
EXPOSE 80
# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]