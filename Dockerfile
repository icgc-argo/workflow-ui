FROM node

WORKDIR /
COPY ./ ./

ENV NODE_ENV production
RUN npm ci

EXPOSE 5000
CMD ["npm", "run", "start-prod"]