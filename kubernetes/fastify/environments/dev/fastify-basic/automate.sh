#!/bin/bash

# exit when any command fails
set -e

new_version=$1

echo "new version: $new_version"

# Simulate release of the new docker images
docker tag asdutoit/fastify-basic asdutoit/fastify-basic:$new_version

# Push new version to dockerhub
docker push asdutoit/fastify-basic:$new_version

tmp_dir=$(mktemp -d)
echo "tmp_dir: $tmp_dir"

# Clone the repo
git clone git@github.com:asdutoit/test-docker.git $tmp_dir

# Update the version in the kubernetes yaml
sed -i '' -e "s/asdutoit\/fastify-basic:.*/asdutoit\/fastify-basic:$new_version/g" $tmp_dir/kubernetes/fastify/environments/dev/fastify-basic/deployment.yml

# Commit and push the changes
cd $tmp_dir
git add .
git commit -m "Update fastify-basic to version $new_version"
git push

# Cleanup
rm -rf $tmp_dir