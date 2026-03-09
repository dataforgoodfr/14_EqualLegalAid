# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_ variables are embedded at build time, so they must be passed as build args
ARG VITE_AIRTABLE_API_KEY
ARG VITE_AIRTABLE_BASE_ID
ARG VITE_AIRTABLE_TABLE_NAME

ENV VITE_AIRTABLE_API_KEY=$VITE_AIRTABLE_API_KEY
ENV VITE_AIRTABLE_BASE_ID=$VITE_AIRTABLE_BASE_ID
ENV VITE_AIRTABLE_TABLE_NAME=$VITE_AIRTABLE_TABLE_NAME

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
