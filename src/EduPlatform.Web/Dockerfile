FROM node:18-alpine AS build
WORKDIR /app
COPY ["src/EduPlatform.Web/package.json", "src/EduPlatform.Web/package-lock.json*", "./"]
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY ["src/EduPlatform.Web/nginx.conf", "/etc/nginx/conf.d/default.conf"]
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 