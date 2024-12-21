FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile --prefer-offline --network-timeout 100000

COPY . .

FROM node:20-alpine AS runtime

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package.json /usr/src/app/yarn.lock ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json
COPY --from=builder /usr/src/app/postcss.config.mjs ./postcss.config.mjs

EXPOSE 3000

CMD ["yarn", "dev"]