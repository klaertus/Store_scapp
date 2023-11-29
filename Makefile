deploy:
	make run-back
	make run-front

run-front: 
	./front-end/deploy.sh
	
run-back:
	./deploy.sh
	



