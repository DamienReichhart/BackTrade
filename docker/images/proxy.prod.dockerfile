FROM nginx:alpine

COPY docker/config/proxy/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80