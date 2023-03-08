#!/bin/bash
export $(grep -v '^#' .env | xargs)

DEV=false
PROD=false
BUILD=false
K8S=false
DASHBOARD=false
REPLICAS=10
AUTOSCALE=false
MODE=$1

for i in "${@:2}"; do
    case $i in
        --dev)
            DEV=true
            PROD=false
            shift
            ;;
        --prod)
            PROD=true
            DEV=false
            shift
            ;;
        --build)
            BUILD=true
            shift
            ;;
        --k8s)
            K8S=true
            shift
            ;;
        --dashboard)
            DASHBOARD=true
            shift
            ;;
        
        --auto)
            AUTOSCALE=true
            shift
            ;;
            
        --replicas=*)
            REPLICAS="${i#*=}"
            shift
            ;;
        *)
            if [ "$MODE" != "stress" ]; then
                echo "Usage: manage.sh [deploy|stop [--k8s [--dashboard]] [--dev|--prod] [--build] | stress [url] | scale [--dev|--prod] [--replicas=1]] "
                exit 1
            fi
            ;;
    esac
done

if [ "$MODE" = "deploy" ]; then
    if [ "$DEV" = true ] || [ "$PROD" = false ]; then
        if [ "$K8S" = true ]; then
            kubectl create namespace do2223-c10-dev
            helm install mongo-dev ./helm/mongo-db --set global.infrastructure=do2223-c10-dev --set global.node_env=development
            helm install backend-dev ./helm/backend --set global.infrastructure=do2223-c10-dev --set global.node_env=development --set firebase_credentials=$FIREBASE_CREDENTIALS --set hpa.enabled=false
        else
            export NODE_ENV=development
            export BACKEND_URL="http://localhost:8081"
            export FRONTEND_PORT=3001
            export PORT=8081
            if [ "$BUILD" = true ]; then
                docker-compose -p "development-environment" --env-file .env up -d --build
            else
                docker-compose -p "development-environment" --env-file .env up -d
            fi
        fi
    fi

    if [ "$PROD" = true ] || [ "$DEV" = false ]; then
        if [ "$K8S" = true ]; then
            kubectl create namespace do2223-c10-prod
            kubectl create clusterrolebinding permissive-binding --clusterrole=cluster-admin --user=admin --user=kubelet --group=system:serviceaccounts
            helm install mongo-prod ./helm/mongo-db --set global.infrastructure=do2223-c10-prod --set global.node_env=production
            helm install backend-prod ./helm/backend --set global.infrastructure=do2223-c10-prod --set global.node_env=production --set firebase_credentials=$FIREBASE_CREDENTIALS --set hpa.enabled=$AUTOSCALE --set hpa.maxReplicas=$REPLICAS
            helm install ingress-prod ./helm/ingress --set global.infrastructure=do2223-c10-prod --set global.node_env=production
        else
            export NODE_ENV=production
            export BACKEND_URL="http://localhost:8080"
            export FRONTEND_PORT=3000
            export PORT=8080
            if [ "$BUILD" = true ]; then
                docker-compose -p "production-environment" --env-file .env up -d --build
            else
                docker-compose -p "production-environment" --env-file .env up -d
            fi
        fi
    fi

    if [ "$K8S" = true ] && [ "$DASHBOARD" = true ]; then
        kubectl apply -f ./helm/metrics-server.yaml
        kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
        kubectl proxy &
        token=$(kubectl -n kubernetes-dashboard create token default)
        echo -e "\nDashboard available at http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/"
        echo -e "\nlogin token:\n$token"
    fi

elif [ "$MODE" = "stop" ]; then
    if [ "$K8S" = true ]; then
        if [ $(kubectl get pods -n kubernetes-dashboard | wc -l) -gt 1 ]; then
            kubectl delete -f ./helm/metrics-server.yaml
            kubectl delete -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
            kill $(ps -ef | grep 'kubectl' | awk '{print $2}')
        fi

        if [ "$DEV" = true ] || [ "$PROD" = false ]; then
            helm uninstall mongo-dev
            helm uninstall backend-dev
            kubectl delete namespace do2223-c10-dev
        fi

        if [ "$PROD" = true ] || [ "$DEV" = false ]; then
            helm uninstall mongo-prod
            helm uninstall backend-prod
            helm uninstall ingress-prod
            kubectl delete namespace do2223-c10-prod
            kubectl delete clusterrolebinding permissive-binding
        fi
    else
        if [ "$DEV" = true ] || [ "$PROD" = false ]; then
            docker-compose -p "development-environment" down -v
        fi

        if [ "$PROD" = true ] || [ "$DEV" = false ]; then
            docker-compose -p "production-environment" down -v
        fi
    fi

elif [ "$MODE" = "stress" ]; then
    regex='https?://[[:alnum:].-]+(/[[:alnum:].-]*)?'
    if [[ $2 =~ $regex ]]; then
        if [[ $3 == "-v" ]]; then
            npx apipecker 5 1000 1000 "$2" -v
        elif [[ -z $3 ]]; then
            npx apipecker 5 1000 1000 "$2"
        else
            echo "Usage: manage.sh stress [url] [-v]"
        fi
    else
        echo "Usage: manage.sh stress [url] [-v]"
    fi

elif [ "$MODE" = "scale" ]; then
    if [ "$DEV" = false ] || [ "$PROD" = true ]; then
        kubectl scale deployment do2223-c10-prod-backend --replicas=$REPLICAS -n do2223-c10-prod
    fi

    if [ "$PROD" = false ] || [ "$DEV" = true ]; then
        kubectl scale deployment do2223-c10-dev-backend --replicas=$REPLICAS -n do2223-c10-dev
    fi


else
    echo "Usage: manage.sh [deploy|stop [--k8s [--dashboard | --auto]] [--dev |--prod] [--build] | stress [url] [-v] | scale [--dev|--prod] [--replicas=1]] "
fi
