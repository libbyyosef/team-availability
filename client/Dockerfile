# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# SPEED/RELIABILITY: configure npm retries + registry
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-retry-mintimeout 10000

# Copy only package.json to leverage Docker cache
COPY package.json ./

# Use npm install (not ci) since lockfile isn’t present locally
RUN npm install --no-audit --no-fund

# Now copy the rest and build
COPY . .
RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
