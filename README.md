# Acme Explorer App
This is a simple app that demonstrates how orchestation works between three different containerized services: a web server, a database and the user interface.

## Contents
- [Deploying the app](#deploying-the-app)
- [Stopping the app](#stopping-the-app)
- [Scaling the app](#scaling-the-app)
- [Simulating stress](#simulating-stress)
    - [DDoS attack simulation](#ddos-attack-simulation)
    - [Auto scaling](#auto-scaling)
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
./manage.sh stress http://localhost/api/v1/trips -v
```

3. Once the requests are returning 200 OK, run stress again calling `/crash`:
```
./manage.sh stress http://localhost/crash
```

You should see that requests are starting to return 404 and 502 instead of 200, since the app is crashing on loop. You can try to handle the attack by scaling the app and see if responses go back to 200 OK:
```
./manage.sh scale --prod --replicas=10
```

### Auto scaling
The app can be scaled automatically if the --auto flag is passed to the `deploy` command. This will create a Horizontal Pod Autoscaler that will scale the app based on the CPU usage. The `stress` command can be used to simulate stress and see how the app scales automatically.

1. Open a terminal and deploy the app with k8s and auto scaling:
```
./manage.sh deploy --k8s --prod --auto
```

2. Stress the app calling some endpoint:
```
./manage.sh stress http://localhost/api/v1/trips -v
```

## Monitorization dashboard
The `manage.sh` script provides a simple way to deploy a dashboard to monitorize the app.

```
./manage.sh deploy --k8s [--dev|--prod] --dashboard
```

The dashboard will be available at http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/ and will ask for a token. This token is printed in the console when the script is executed.