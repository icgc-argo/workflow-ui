FROM node

WORKDIR /
COPY ./ ./

RUN npm ci
RUN npm run build
RUN npm i -g serve

EXPOSE 5000
CMD ["serve", "-s", "build"]