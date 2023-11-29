#!/bin/bash



docker build -t scapp-cart back-end/cart-service/cart/.

docker build -t scapp-log back-end/log-service/log/.

docker build -t scapp-order back-end/order-service/order/.

docker build -t scapp-user back-end/user-service/users/.

docker build -t scapp-product back-end/product-service/product/.



docker stack rm scapp
docker stack deploy -c scapp.yml scapp
