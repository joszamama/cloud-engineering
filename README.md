# Simple Devices App

This is a simple app that demonstrates how orchestation works between three different containerized services: a web server, a database and the user interface.

## Contents
- [Deploying the app](#deploying-the-app)
- [Stopping the app](#stopping-the-app)
- [Scaling the app](#scaling-the-app)
- [Simulating stress](#simulating-stress)
    - [DDoS attack simulation](#ddos-attack-simulation)
- [Testing with KS-API](#testing-with-ks-api)
    - [Test for one replica and one user](#test-for-one-replica-and-one-user)
    - [Test for n replicas and m users](#test-for-n-replicas-and-m-users)
- [Monitorization dashboard](#monitorization-dashboard)

## Deploying the app
The script `manage.sh` can be used to simply deploy the app.
```
./manage.sh deploy [--k8s [--dasboard]] [--dev|--prod|--build]
```
The `--dev` option will deploy the app in development mode, the `--prod` option will deploy the app in production mode and the `--build` option will build the containers before deploying them. Running `deploy` without any options will deploy both environments.

The `--k8s` will deploy the app in a kubernetes environment using Helm. If `--prod` is specified, it will create an ingress-nginx that allow access through ports 80 and 443, whereas when `--dev` is specified it will bind the backend to port `31600` through NodePort. If none is passed, it will deploy both.

## Stopping the app
The script `manage.sh` also provides a simple way to stop the app.
```
./manage.sh stop [--k8s] [--dev|--prod]
```
The `--dev` option will stop the development environment, the `--prod` option will stop the production environment and running `stop` without any options will stop both environments. The `--k8s` will stop containers and remove resources from the cluster.

> **Note:** The `stop` command will remove not only containers, but also attached volumes.

## Scaling the app
The script `manage.sh` is able to scale the application while running based on input.
```
manage.sh scale [--dev|--prod] --replicas=1
```
Depending on the `--dev` or `--prod` flag, the scaling will be done for development or production environment, respectively. The `--replicas` arguments controls the number of replicas that will be handled by the deployment.

## Simulating stress
The script `manage.sh` offers the posibility to simulate stress by sending multiple concurrent requests to the app thanks to [apipecker](https://www.npmjs.com/package/apipecker).
```
manage.sh stress [url]
```

### DDoS attack simulation
A DDoS attack can be simulated by stressing the app calling the `/crash` endpoint while trying to get data:

1. Open a terminal and deploy the with k8s:
```
./manage.sh deploy --k8s --prod
```

2. Stress the app calling some endpoint:
```
./manage.sh stress http://localhost/api/v1/devices -v
```

3. Once the requests are returning 200 OK, run stress again calling `/crash`:
```
./manage.sh stress http://localhost/crash
```

You should see that requests are starting to return 404 and 502 instead of 200, since the app is crashing on loop. You can try to handle the attack by scaling the app and see if responses go back to 200 OK:
```
./manage.sh scale --prod --replicas=10
```

## Testing with KS-API
### Test for one replica and one user
KS-API calculates np-complete problems and returns the result. It is used to test the app. The following steps describe how to test the app for 1 replica of the ks-api receiving 1 request per second for 1 minute. The objective is to obtain a mean response time of 500ms.

1. Deploy the app with k8s and development mode
```
./manage.sh deploy --k8s --dev
```

2. Run apipecker to make requests to ks-api
```
npx apipecker 1 60 1000 http://localhost:32607/api/v1/stress/M/N
```

A mean request time of 500ms has been obtained for M=230000 and N=200000. The following table shows the results for different values of M and N:

| M | N | Mean response time (ms) |
|---|---|-------------------------|
| 200000 | 200000 | 410.165 |
| 220000 | 200000 | 443.169 |
| 230000 | 200000 | 465.67 |
| 250000 | 200000 | 522.5 |

### Test for n replicas and m users
The following steps describe how to test the app for n replicas of the ks-api receiving 1 requests per second from m concurrent users for 1 minute. The objective is to obtain a mean response time of 500ms.

1. Deploy the app with k8s and development mode
```
./manage.sh deploy --k8s --dev
```

2. Run apipecker to make requests to ks-api
```
npx apipecker m 60 1000 http://localhost:32607/api/v1/stress/M/N
```

3. Scale the ks-api deployment
```
kubectl scale deployment do2223-c10-dev-ks-api --replicas=n -n do2223-c10-dev
```

The followig table shows the results for different values of M, N, n and m:

| n (replicas) | m (users) | M | N | Mean response time (ms) |
|--------------|-----------|---|---|-------------------------|
| 1 | 1 | 100000 | 100000 | 198.309 |
| 1 | 2 | 100000 | 100000 | 295.426 |
| 1 | 3 | 100000 | 100000 | 390.419 |
| 1 | 4 | 100000 | 100000 | 485.653 |
| 1 | 5 | 100000 | 100000 | 575.527 |
| 2 | 1 | 100000 | 100000 | 205.06 |
| 2 | 2 | 100000 | 100000 | 251.365 |
| 2 | 3 | 100000 | 100000 | 303.552 |
| 2 | 4 | 100000 | 100000 | 345.949 |
| 2 | 5 | 100000 | 100000 | 395.157 |
| 2 | 6 | 100000 | 100000 | 471.887 |
| 2 | 7 | 100000 | 100000 | 543.225 |
| ... | ... | ... | ... | ... |
| 10 | 10 | 100000 | 100000 | 478.842 |
| 10 | 11 | 100000 | 100000 | 501.266 |
| 10 | 12 | 100000 | 100000 | 523.285 |

## Monitorization dashboard
The `manage.sh` script provides a simple way to deploy a dashboard to monitorize the app.

```
./manage.sh deploy --k8s [--dev|--prod] --dashboard
```

The dashboard will be available at http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/ and will ask for a token. This token is printed in the console when the script is executed.