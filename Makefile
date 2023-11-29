deploy:
	make run-back
	make run-front

run-front: 
	./src/front-end/deploy.sh
	
run-back:
	./src/deploy.sh
	



