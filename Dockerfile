FROM node:23.10.0-slim

# build-essential + python3: better-sqlite3 and bcrypt are native modules that
# may need to compile from source if no prebuilt binary matches this Node ABI.
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
