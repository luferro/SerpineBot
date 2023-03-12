#! /bin/bash

usage() { echo "Usage: $0 [-r <repository>] [-f <folder>] [-c <container>]" 1>&2; exit 1; }

while getopts r:f:c: flag
do
    case "${flag}" in
        r) repository=${OPTARG};;
        f) folder=${OPTARG};;
        c) container=${OPTARG};;
        *) usage;;
    esac
done

if [ -z "${repository}" ] || [ -z "${folder}" ] || [ -z "${container}" ]; then
    usage
fi

if ! docker info > /dev/null 2>&1; then
  echo "Docker is required to execute this script"
  exit 1
fi

dir="/root/$folder"
if [ -d $dir ]; then
    echo "Step 1: Pulling changes from $repository"
    cd $dir
    git pull
else
    echo "Step 1: Cloning $repository into $dir"
    git clone https://github.com/luferro/$repository.git $dir
    echo "$repository has been cloned into $dir"
    echo ".env configuration file is required"
    exit
fi

echo "Step 2: Rebuild $container"
docker compose up --build --force-recreate --no-deps -d $container

echo "Step 3: Remove unused containers, networks and images"
docker system prune -f