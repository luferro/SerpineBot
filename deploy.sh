#! /bin/bash

while getopts r:p:o: flag
do
    case "${flag}" in
        r) repository=${OPTARG};;
        p) process=${OPTARG};;
        o) output=${OPTARG};;
    esac
done

if [ "$EUID" -ne 0 ]; then
    echo "root permission required."
    exit
fi

echo "Step 1: Installing node.js"
if which node > /dev/null; then
    echo "Already installed. Skipping..."
else
    # Ubuntu distributrion. Please refer to https://nodejs.org/en/download/package-manager/ for other distributions
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - && sudo apt-get install -y nodejs
    echo "node.js $(node -v) has been installed."
fi

echo "Step 2: Installing pnpm"
if which pnpm > /dev/null; then
    echo "Already installed. Skipping..."
else
    corepack enable
    corepack prepare pnpm@latest --activate
    echo "pnpm $(pnpm -v) has been installed."
fi

echo "Step 3: Installing pm2"
if which pm2 > /dev/null; then
    echo "Already installed. Skipping..."
else
    npm install -g pm2
    echo "pm2 $(pm2 -v) has been installed"
fi

dir="/root/$process"
if [ -d $dir ]; then
    echo "Step 4: Pulling changes from $repository"
    cd $dir
    git pull
    pm2 delete $process
else
    echo "Step 4: Cloning $repository into $dir"
    git clone https://github.com/luferro/$repository.git $dir
    echo "$repository has been cloned into $dir"
    echo "Additional configuration required. Create a .env within the application folder following .env.example guidelines."
    exit
fi

echo "Step 5: Installing dependencies"
pnpm install --frozen-lockfile

echo "Step 6: Build"
pnpm build

echo "Step 7: Starting $process in working directory $PWD"
cd $output
cd ../
pm2 start "pnpm start" --name $process

echo "Step 8: Save process"
pm2 save