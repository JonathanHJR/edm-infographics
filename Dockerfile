FROM gdssingapore/airbase:node-22-builder AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM gdssingapore/airbase:node-22
WORKDIR /app
COPY --chown=app:app --from=builder /app/.next ./.next
COPY --chown=app:app --from=builder /app/node_modules ./node_modules
COPY --chown=app:app --from=builder /app/package.json ./
COPY --chown=app:app --from=builder /app/public ./public
USER app
EXPOSE 3000
CMD ["npm", "start"]
