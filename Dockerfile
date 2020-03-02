FROM node:12.13.1-alpine

ENV NODE_ENV production
ENV APP_UID=9999
ENV APP_GID=9999

WORKDIR /

RUN apk --no-cache add shadow \
   && groupmod -g $APP_GID node \
   && usermod -u $APP_UID -g $APP_GID node \
   && rm -rf /var/cache/apk/*

COPY ./ ./

RUN npm ci

EXPOSE 5000

USER $APP_UID

CMD ["npm", "run", "start-prod"]
