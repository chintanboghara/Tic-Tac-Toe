# -------- Build Stage --------
    FROM node:20-alpine AS build
    WORKDIR /app
    
    # Copy only package files to leverage Docker cache for dependencies
    COPY package*.json ./
    RUN npm ci
    
    # Copy the rest of the application source code
    COPY . .
    
    # Optionally set the production environment variable (helps with optimizations)
    ENV NODE_ENV=production
    
    # Build the application (ensure your build script outputs to the "dist" folder)
    RUN npm run build
    
    # -------- Production Stage --------
    FROM nginx:alpine
    
    # Copy built assets from the build stage into Nginx's public folder
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # Optionally, if you have a custom Nginx configuration, uncomment the next line:
    # COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Expose port 80 to be accessible outside the container
    EXPOSE 80
    
    # Run Nginx in the foreground
    CMD ["nginx", "-g", "daemon off;"]
    