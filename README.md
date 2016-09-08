[![CircleCI](https://circleci.com/gh/byavv/fm-profile.svg?style=shield)](https://circleci.com/gh/byavv/fm-profile)
[![David](https://img.shields.io/david/byavv/fm-profile.svg?maxAge=2592000)]()
[![](https://images.microbadger.com/badges/image/aksenchyk/fm-profile.svg)](https://microbadger.com/images/aksenchyk/fm-profile "Provided by microbadger.com")
[![Docker Automated build](https://img.shields.io/docker/automated/aksenchyk/fm-profile.svg?maxAge=2592000)]()

## Microservice tracker for [funny-market](https://github.com/byavv/funny-market) project

### Features: 
- [rabbitmq](https://www.rabbitmq.com/) messaging via [rabbot](https://github.com/arobson/rabbot)
- [etcd](https://github.com/coreos/etcd) self-registration via [etcd-registry](https://github.com/mafintosh/etcd-registry)

### Usage
```sh
$ npm install -g nodemon 
     ...
$ cd fm-profile
$ npm install
```
### Basic Commands
```sh
$ npm start
$ npm run dev
$ npm test
$ npm run clean
$ npm run serve
```

### Build Docker Image

```sh
$ npm run build:docker
```