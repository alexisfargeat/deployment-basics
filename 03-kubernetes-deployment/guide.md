# Deploying the ToDo App in Kubernetes

## Deploying the database

To start, we have to deploy the database service to the Kubernetes cluster. Since it is the hardest part of this, a simple deployment is already configured in the `postgres.yml`. To apply it, you have to run :

```bash
minikube kubectl -- apply -f postgres.yml
```

You can see it is running using the command :
```bash
minikube kubectl -- get pods
```

## Deploying the Frontend

### Creating a Deployment

Create a file: `frontend/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: # e.g., todo-frontend
spec:
  replicas: # in this case we want one
  selector:
    matchLabels:
      app: # must match template metadata labels
  template:
    metadata:
      labels:
        app: # same as above
    spec:
      containers:
        - name: # container name
          image: ghcr.io/alexisfargeat/deployment-basics/todo-frontend:latest
          ports:
            - containerPort: # e.g., 80
```

Apply it with:
```bash
minikube kubectl -- apply -f frontend/deployment.yaml
```

You can check if it is working either in the dashboard (`minikube dashboard`) or by using dedicated command : `kubectl get pods`
We will need to edit this part later to add environment variables and access to the backend.


### Adding a Service

Create a file: `frontend/service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: # e.g., todo-frontend
spec:
  selector:
    app: # must match deployment label
  ports:
    - protocol: TCP
      port: # service port
      targetPort: # container port
  type: # e.g., ClusterIP
```

Apply the service:
```bash
minikube kubectl -- apply -f frontend/service.yaml
```

You can also check if it is working using the dashboard or `kubectl get service`. To test the app, you can run `minikube service {name-of-the-service} --url`.

### Adding an Ingress

Now, we want to be able to access the app with a domain name. To do so, start by creating a file, for example `ingress.yaml`, since we may use it later to also work with the backend.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: # e.g., todo-frontend
spec:
  rules:
    - host: # e.g., todo.localhost
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: # must match service name
                port:
                  number: # service port (e.g., 80)
```

Apply the ingress:
```bash
minikube kubectl -- apply -f ingress.yaml
```

Then, add this to your `/etc/hosts`:

```bash
127.0.0.1   # host
# or with the cluster IP if on linux (minikube ip)
```

For Mac users, you also have to execute the following command to be able to access the ingress : `kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec": {"type": "LoadBalancer"}}'`, and then you can launch the command `minikube tunnel`. It is a fix to use minikube but you should not have to worry when deploying an app since those are already configured.

## Deploying the backend

The process is basically the same to deploy the backend. However, we have to add the database url to the environnement. It can be added in the container template using the `env` key :

```yaml
env:
  - name: VAR_NAME
    value: value
```
