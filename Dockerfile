FROM node

WORKDIR /
COPY ./ ./

RUN npm ci

EXPOSE 5000
CMD ["npm", "run", "start-prod"]