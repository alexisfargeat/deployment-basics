# ☸️ Setting Up a Local Kubernetes Cluster

This guide will walk you through installing and running a local Kubernetes cluster using [Minikube](https://minikube.sigs.k8s.io/). It's ideal for testing, development, and learning purposes.

---

## 🔧 Installing Minikube

You'll need the following tools installed on your system:

- A container runtime: **Docker**, **Podman**, or **containerd**
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (Optional)

### Using Homebrew (macOS/Linux)

```bash
brew install minikube
brew install kubectl
```

### On Linux (manual install)

```bash
curl -LO https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube && rm minikube-linux-amd64
```

---

## 🚀 Create the Kubernetes Instance

Start your cluster using Docker as the driver:

```bash
minikube start --driver=docker --addons metrics-server --addons ingress --addons dashboard
```

If you prefer VirtualBox or another driver:

```bash
minikube start --driver=virtualbox --addons metrics-server --addons ingress --addons dashboard
```

You can verify Minikube is running with:

```bash
minikube status
```

---

## ✅ Checking Everything Is Running

Use `kubectl` to inspect your cluster:

```bash
minikube kubectl -- get nodes
minikube kubectl -- get pods -A
```

You can also open the Minikube dashboard in your browser:

```bash
minikube dashboard
```

This gives you a graphical overview of your cluster, pods, services, and more.

---

## 🧹 Cleaning Up

When you are done with this tutorial, you can remove the minikube instance.

To stop the cluster:

```bash
minikube stop
```

To delete everything:

```bash
minikube delete
```

This will remove the virtual machines, containers, and configuration associated with your Minikube instance.

---

You're now ready to deploy your first workloads into your local Kubernetes cluster! Continue with [the guide](./guide.md) to learn how to use Kubernetes resources.
