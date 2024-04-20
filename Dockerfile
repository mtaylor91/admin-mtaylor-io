FROM docker.io/nginx
COPY dist /usr/share/nginx/html
ADD nginx.server.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
