FROM node:20-slim

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Run the dev server listening on all network interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
