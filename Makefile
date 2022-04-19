PREFIX 		:= webfront/
SUFFIX 		:= Concenet_Front
ENV    		:= prod
NAME   		:= ${PREFIX}${SUFFIX}-${ENV}
TAG    		:= $$(git log -1 --pretty=%h)
APP_VERSION := $$(node -p "require('./package.json').version")
IMG    		:= ${NAME}:${TAG}
LATEST 		:= ${NAME}:latest
VERSION		:= ${NAME}:${APP_VERSION}

.PHONY: help

help: ## Print this help.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build the docker image for a given ENV (default: ENV=prod), tagging it as "latest", current app version (ex: "0.0.1") and current git commit (ex: "63de199").
	docker build --build-arg APP=${SUFFIX} --build-arg ENV=${ENV} -t ${IMG} .
	@echo "Tagging docker image: ${LATEST} ${VERSION}"
	@docker tag ${IMG} ${LATEST}
	@docker tag ${IMG} ${VERSION}

remove: ## Remove the docker image tags for "latest", current version (ex: "0.0.1") and commit (ex: "63de199"), and for a given ENV (default: ENV=prod). Useful in CI to free space after pushing created images.
	docker rmi -f ${IMG} ${LATEST} ${VERSION}