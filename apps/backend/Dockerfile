FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile --prefer-offline --network-timeout 100000

COPY . .

RUN npx prisma generate

FROM node:20-alpine AS runtime

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package.json /usr/src/app/yarn.lock ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/por.traineddata ./por.traineddata
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json
COPY --from=builder /usr/src/app/tsconfig.build.json ./tsconfig.build.json

EXPOSE 3000

CMD ["yarn", "start:dev"]