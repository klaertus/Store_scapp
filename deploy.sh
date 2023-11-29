#!/bin/bash



docker build -t scapp-cart src/back-end/cart-service/cart/.

docker build -t scapp-log src/back-end/log-service/log/.

docker build -t scapp-order src/back-end/order-service/order/.

docker build -t scapp-user src/back-end/user-service/users/.

docker build -t scapp-product src/back-end/product-service/product/.



docker stack rm scapp
docker stack deploy -c src/scapp.yml scapp
