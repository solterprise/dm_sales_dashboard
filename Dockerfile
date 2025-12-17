# Этап 1: Сборка приложения
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Собираем приложение
RUN npm run build

# Этап 2: Запуск приложения
FROM node:22-alpine

WORKDIR /app

# Устанавливаем serve для раздачи статики
RUN npm install -g serve

# Копируем собранное приложение из этапа builder
COPY --from=builder /app/dist ./dist

EXPOSE 4000

# Запускаем приложение на порту 4000
CMD ["serve", "-s", "dist/dm-dashboard/browser", "-l", "4000"]
