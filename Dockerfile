FROM node:12.13.1-alpine

ENV APP_UID=9999
ENV APP_GID=9999
ENV APP_HOME=/srv
ENV NODE_ENV production
RUN apk --no-cache add shadow \
    && groupmod -g $APP_GID node \
    && usermod -u $APP_UID -g $APP_GID node \
    && mkdir -p $APP_HOME \
    && chown -R node $APP_HOME

USER node
WORKDIR $APP_HOME

COPY ./ ./
RUN npm ci
EXPOSE 5000
CMD ["npm", "run", "start-prod"]
