#!/bin/zsh

source .env

if [[ -z "$APP_DIR" || -z "$NGINX_DIR" ]]; then
  echo "Error: Environment variables not set"
  exit 1
fi

cd "$APP_DIR" || { echo "Error: Failed to change directory to $APP_DIR"; exit 1; }

# git pull origin main

npm i || { echo "Error: npm install failed"; exit 1; }
npm run build || { echo "Error: npm build failed"; exit 1; }

if [[ -d "$NGINX_DIR" ]]; then
  echo "Removing contents of $NGINX_DIR"
  sudo rm -rf "$NGINX_DIR/*"
else
  echo "Creating $NGINX_DIR directory"
  sudo mkdir -p "$NGINX_DIR" || { echo "Error: Failed to created $NGINX_DIR"; exit 1; }
  sudo chmod 755 "$NGINX_DIR"
fi

sudo cp -r dist/* "$NGINX_DIR" || { echo "Error: Failed to copy files to $NGINX_DIR"; exit 1; }

sudo chown -R nginx:nginx "$NGINX_DIR"
sudo find "$NGINX_DIR" -type d -exec chmod 755 {} \;
sudo find "$NGINX_DIR" -type f -exec chmod 644 {} \;

# Create Nginx configuration file
sudo tee "/etc/nginx/conf.d/leapp_IPU_client.conf" > /dev/null <<EOF
server {
  listen       8080;
  listen       [::]:8080;
  server_name  _;
  root $NGINX_DIR;
  index index.html;

  location / {
    try_files \$uri \$uri/ /index.html;
  }

  error_page 404 /404.html;
  location = /404.html {
  }

  error_page 500 502 503 504 /50x.html;
  location = /50x.html {
  }
}
EOF

sudo nginx -t || { echo "Error: Nginx configuration test failed"; exit 1; }
sudo systemctl restart nginx

echo "Deployment completed"
