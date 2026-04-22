# --- stage 1 --- # 
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

COPY . .

RUN sh -c "corepack enable && (yarn install --immutable || yarn install --frozen-lockfile)"
RUN yarn build   # CRA genera en /app/build

# --- stage 2 --- # 
FROM nginx:1.27-alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

RUN mkdir -p /usr/share/nginx/html/config

EXPOSE 80