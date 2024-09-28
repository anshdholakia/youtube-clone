# To have the dockerfile create the build for deployment have a multi-stage dockerfile
# Ser the dockerfile to make image on top of node:18
FROM node:18 as builder

# Make a work directory in the image
WORKDIR /app

# Copy over the package.json and package-lock.json to the work directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy over the rest of the source code
COPY . .

# Build
RUN npm run build

# New stage for production
FROM node:18

# Set working directory
WORKDIR /app

# Copy over the package.json and package-lock.json to the work directory
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Install ffmpeg for video processing
RUN apt-get update && apt-get install -y ffmpeg

# Copy over the build files
COPY --from=builder /app/dist ./dist

# Start the server
EXPOSE $BACKEND_PORT

CMD ["npm", "run", "serve"]