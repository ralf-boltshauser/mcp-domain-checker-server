# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
FROM node:lts-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependency definitions
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the project
RUN pnpm build

# Expose a port if necessary (for inspector, port 6274) - optional
EXPOSE 6274

CMD ["node", "dist/index.cjs"]
