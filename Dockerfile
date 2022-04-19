# NPM INSTALL
FROM node:14-alpine as dependencies
RUN apk add openjdk11 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN npm install --no-progress

# Angular build
FROM dependencies as build
ARG ENV
COPY . /app
RUN npm run --silent build -- --configuration=$ENV --no-progress

# Final image
FROM nginx:1.19.2-alpine
ARG APP
COPY /nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build "/app/dist/$APP"  /usr/share/nginx/html

RUN echo "for mainFileName in /usr/share/nginx/html/main*.js ;\
    do \
    envsubst '\$API_BASE_URL ' < \$mainFileName > main.tmp ;\
    mv main.tmp \${mainFileName} ;\
    done \
    && nginx -g 'daemon off;'" > run.sh

ENTRYPOINT ["sh", "run.sh"]