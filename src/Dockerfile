# Этап 1: Сборка приложения
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Собираем приложение (для Angular используй правильную команду)
RUN npm run build

# Этап 2: Запуск приложения
FROM node:18-alpine

WORKDIR /app

# Устанавливаем serve для раздачи статики
RUN npm install -g serve

# Копируем собранное приложение из этапа builder
COPY --from=builder /app/dist ./dist

# Если нужно, копируем также package.json для остальных зависимостей
COPY package*.json ./

EXPOSE 4000

# Запускаем приложение на порту 4000
# Если используется Express/Node сервер - измени команду на CMD ["node", "dist/server.js"]
CMD ["serve", "-s", "dist/dm-dashboard", "-l", "4000"]
