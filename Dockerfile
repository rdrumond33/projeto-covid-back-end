FROM node:lts-stretch
WORKDIR /app
COPY ./package.json .
RUN yarn install
COPY . .
EXPOSE 8080/tcp
ENV PORT=8080
CMD [ "npm","start" ]