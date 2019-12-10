FROM node

WORKDIR /
COPY ./ ./

RUN npm ci
RUN npm i -g serve

EXPOSE 5000
CMD ["npm", "run", "build", "&&", "serve", "-s", "build"]