[![Staging CI (NX-Apps)](https://github.com/D-F-Group/apiback/actions/workflows/stage-ci.yml/badge.svg?branch=dev)](https://github.com/D-F-Group/apiback/actions/workflows/stage-ci.yml)

## Prepare production PC on ubuntu or darwin

### Copy dev ssh to server

```
cat ~/.ssh/id_rsa.pub | ssh root@38.242.247.40 "mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys && chmod -R go= ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### Update OS

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get dist-upgrade
sudo apt autoremove
sudo apt install -f
```

### Install git

```
sudo apt install git
```

### Install NVM

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm install v16.18.1
nvm use v16.18.1
apt install g++ make python
npm install --global yarn
n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local
```

### Docker

https://docs.docker.com/engine/install/ubuntu/

```
# export VERSION=19.03.15
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
dockerd-rootless-setuptool.sh install
sudo chown $USER /var/run/docker.sock
sudo systemctl restart docker
```

### Start NATS

```
docker run -d --name nats-main -p 4222:4222 -p 6222:6222 -p 8222:8222 nats -js -m 8222
Change ports if its needed
```

### Install mysql in VPS

read and process
https://docs.rackspace.com/support/how-to/install-mysql-server-on-the-ubuntu-operating-system/

### Add basic authorization

https://www.cloudsavvyit.com/14258/how-to-add-http-basic-authentication-to-a-kubernetes-nginx-ingress/

# Migration

```
Go to root folder
npm run migrate:latest
```

# Start server on production mode

```
Go to root folder
pm2 start pm2.json --env .env
```
