# Containerization 🐳📦

In this section, the goal is to learn how to create Docker images by containerizing the provided Todo app in this
repository. You will gain hands-on experience with Docker, understand the basics of containerization, and see how to
package applications for consistent deployment across different environments.

## Todo App Overview 📝

The todo app is a simple application that allows users to create, read, update, and delete tasks. It is composed of :

- 🖥️ A frontend built with Next.js
- 🐍 A backend built with FastAPI + Pydantic
- 🐘 A PostgreSQL database

```mermaid
---
title: Todo App Architecture
---
flowchart LR
    A["Frontend (NextJS)"] -->|HTTP Requests| B["Backend (FastAPI)"]
    B -->|Database Queries| C[PostgreSQL Database]
    B -->|HTTP Responses| A
```

In the folder `apps`, you will find:

- `frontend`: The Next.js application for the user interface : it uses `npm` as package manager.
- `backend`: The FastAPI application for the API, that uses `uv` as package manager.
- `compose.yaml`: The Docker Compose file that create a development postgres database.

## Prerequisites 📚

Before starting with the containerization process, make sure you create a development environment by running a
PostgreSQL
database using Docker Compose. You can do this by running the following command in the `apps` directory:

```bash
docker compose up -d
```

## Practical Steps 🛠️

The main goal is to containerize the Todo app by creating Docker images for both the frontend and backend applications.
You will also learn how to use Docker Compose to manage multi-container applications.

### Step 1: Containerize the Frontend 🚀

Since the app uses Next.js for the frontend, a good idea is to look at the Next.js documentation to see if they explain
how to create a docker image.
In this case, it can be found
at [Next.js Docker Documentation](https://nextjs.org/docs/app/getting-started/deploying#docker).

However, in this guide we will focus on creating it from scratch, so here are the first steps :

#### First iteration : straightforward Dockerfile 🏗️

1. 📄 Create a `Dockerfile` in the `apps/frontend` directory.
2. 🏗️ Choose a base image for the Docker image. Since Next.js is a Node.js application, we have to use a
   Node.js base image.
   For example, you can use `node:22-slim` as a lightweight base image (actually the `alpine` variant is smaller, but it
   requires extra-steps to use with Next.js). A fixed version of the image is recommended to ensure consistency over
   time. It is done with the `FROM` command in the Dockerfile.
3. 📁 Set the working directory inside the container. This can be done with the `WORKDIR` command.
   For example, you can set it to `/app`.
4. 📦 Copy the files to the container using the `COPY` command. You can copy the entire `apps/frontend` directory to the
   `/app`
   directory in the container. Make sure you use relative paths to the Dockerfile.
5. 📥 Install the dependencies using the package manager. For Next.js, you can use `npm install`.
   This can be done with the `RUN` command. It is recommended to use `npm ci` for production builds, as it installs
   packages with the version specified in the `package-lock.json` file, instead of trying to update them.
6. 🏗️ Build the Next.js application using the `RUN` command. This can be done with `npm run build`.
7. 🗂️ Understand how the build output can be served. Since the project use a standalone output, we can
   refer to the
   documentation [here](https://nextjs.org/docs/app/api-reference/config/next-config-js/output#automatically-copying-traced-files).
   We have to transform this command into a `RUN` command in the Dockerfile.
   `cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/`
8. ▶️ Finally, specify the command to run the application. For Next.js, this can be done with the `CMD` command.
   The command to run the application is `node .next/standalone/server.js`.
   You can also specify the port / host to listen on, using environment variables that you write before the command :
   `PORT=8080 HOSTNAME=0.0.0.0 node server.js`. We can also use the `EXPOSE` command to specify which port the
   application is going to listen on.

Now, you can try to build the Docker image using the following command in the `apps/frontend` directory:

```bash
docker build -t todo-frontend .
```

This will create a Docker image named `todo-frontend` based on the Dockerfile you just created. The `.` means to use the
directory as context for the docker image.
You can then run it using the following command:

```bash
docker run -p 3000:3000 todo-frontend
```

Now you should be able to access the application in your browser at `http://localhost:3000` ! 🎉

However, you can see that the image is quite large, as it contains all the build dependencies and the entire Node.js
environment. This can be checked using the command:

```bash
docker images todo-frontend
```

In this case, the image size is more than 2GB, which is quite large for a simple application.

#### Second iteration : multi-stage build 🏗️➡️🎯

The first iteration of the Dockerfile is a good start, but it can be improved by using a multi-stage build to reduce the
size of the final image. Indeed, the first image contains all the build dependencies, which are not needed in the final
image.

To overcome this, we can use a multi-stage build to create a separate build stage and a final stage that only contains
the files we need to run the application. This is done using multiple `FROM` commands multiple times in the Dockerfile.

First, we can create an alias of the image we want to use as a base image, so that we can refer to it later in the
Dockerfile. We can also put the working directory in this base image, so that we can use it in the other stages.

```dockerfile
FROM node:22-slim AS base
```

Then we can create a build stage that uses the base image and installs the dependencies and builds the application.

```dockerfile
FROM base AS build
```

We need to put all the steps related to the build in this stage, so we can copy the files, install the dependencies, and
build the application.

The next step is to create a final stage that uses the base image again, but this time we will only copy the files we
need to run the application.

```dockerfile
FROM base AS final
```

In this case, the build output is located inside the `.next/standalone` and the `.next/static` directories.
We can copy these directories to the final image from the build stage using the `COPY` command with the `--from` option,
in this case:

```dockerfile
COPY --from=build [origin] [destination] 
```

Finally, we can specify the command to run the application in the final stage, as well as the port to expose, which is
the same as before.

We can now check the size of the image using the same command as before:

```bash
docker images todo-frontend
```

Now the image size dropped to less than 500MB ! 🎉

#### Third iteration : adding .dockerignore to reduce image size and build time 🗂️⚡

To further optimize the Docker image, we can add a `.dockerignore` file in the `apps/frontend` directory. It is the
equivalent of a `.gitignore` file, but for Docker. It allows us to exclude files and directories from being copied to
the Docker image, which allows to reduce the build time but also the size of the image. It reduces the context you load
into the builder, which you can see when you run `docker build`.

Essentially, we want to exclude the same files and directories that we would exclude from a Git repository, such as:

- `node_modules/` (package dependencies are installed inside the container)
- `.next/` (build output directory, as it will be generated inside the container)
- environment files like `.env.local`, `.env.development`, etc.
- `Dockerfile` (if you don't want to copy it to the image)

Here is an example of a `.dockerignore` file for the frontend:

```
# .dockerignore
node_modules/
.next/
.env.local
.env.development
.env.production
Dockerfile
```

You can create this file in the `apps/frontend` directory and then rebuild the Docker image using the same command as
before.

#### Fourth iteration : running image as non-root user 🔒

To enhance security, it is a good practice to run the application inside the Docker container as a non-root user. This
can be done by creating a user in the Dockerfile and switching to that user before running the application.

You can add the following lines to the `final` stage of the Dockerfile:

```dockerfile
# Create a non-root user
RUN addgroup -g 1001 appgroup && adduser -S nextjs -u 1001
```

Then, when copying the files to the final image, you need to set the ownership of the files to the new user and group:

```dockerfile
COPY --chown=nextjs:appgroup --from=build /app/.next/standalone /app/.next/standalone
COPY --chown=nextjs:appgroup --from=build /app/.next/static /app/.next/static
```

Then, switch to the non-root user before running the application:

```dockerfile
USER nextjs
```

The final version of the Dockerfile can be found in the `apps/frontend/Dockerfile` file on the `solutions` branch of
this repository.

### Step 2: Containerize the Backend

The backend of the Todo app is built with FastAPI, which is a Python web framework. It also uses `uv` as package
manager.

You can follow a similar approach to containerize the backend as you did for the frontend. You can follow the `uv`
dockerization guide to
start : [uv Dockerization Guide](https://docs.astral.sh/uv/guides/integration/docker/#installing-uv)

However, you should also skip the multi-stage build part, as the python code does not need to be built before running.

```dockerfile
# Relevant part from the documentation
FROM python:3.12-slim-bookworm
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
```

To test your image, you first need to build the image, then you can run the following command in the `apps/backend`
directory:

```bash
docker run -p 8000:8000 --network apps_default \
  -e DATABASE_URL=postgresql://user:password@postgres:5432/todo
```

This command will run the backend application and expose it on port 8000.

- The `--network apps_default` option allows the backend to connect to the PostgreSQL database running in the Docker
  Compose network.
- The `-e DATABASE_URL=postgresql://user:password@postgres:5432/todo` option sets the environment variable
  `DATABASE_URL` to connect to the PostgreSQL database. The `@postgres` part refers to the domain name given by docker
  to the postgres container, which is `postgres` in this case (as declared in the compose file).

### Bonus step : try to run the frontend and backend together

Now that your backend is running, you can try to run the frontend in a similar way. You can use the same command as
before, but
you need to connect the frontend to the same network as the backend and give it the backend URL as an
environment variable (which is named `API_URL`). You can try to write the command yourself.

<details>
   <summary>Solution</summary>

   ```bash
   docker run -p 3000:3000 --network apps_default \
       -e API_URL=http://backend:8000
   ```

</details>

## Automate the process with Docker Compose

Now that you have ready to build Docker images for both the frontend and backend, you can automate the process of
running them together using
Docker Compose. You can create a `compose.prod.yaml` file in the `apps` directory, and copy the content of the
`compose.yaml` file to it, as we will still use a postgres database in production.

You can then start to define a service for the backend, using the Dockerfile you just created in the `apps/backend`
directory.

```yaml
# apps/compose.prod.yaml
services:
  postgres:
    ...
  backend:
  # THE CODE YOU NEED TO WRITE
```

In many cases, you would use a pre-built image from a registry, but in this case we will use the Dockerfile you just
created. It can be done using the `build` option, which takes as arguments the path to the context and the path to the
Dockerfile (
you can omit it if the Dockerfile is named `Dockerfile` and is in the context directory). See more
at [Docker Compose documentation](https://docs.docker.com/reference/compose-file/build/#illustrative-example).


<details>
   <summary>Solution</summary>

   ```yaml
   backend:
     build:
       context: ./backend
       dockerfile: Dockerfile
   ```

</details>

You then need to specify the ports to expose, which is done using the `ports` option. Reminder: the backend listens on
port 8000. You also need to specify the environment variable to connect to the PostgreSQL database, which is done using
the
`environment` option. You can use the `postgres` service definition as an example. 📝🔧

<details>
   <summary>Solution</summary>

   ```yaml
   backend:
     build:
       context: ./backend
       dockerfile: Dockerfile
     ports:
       - "8000:8000"  # 🚪 Expose backend port
     environment:
       DATABASE_URL: postgresql://user:password@postgres:5432/todo  # 🔗 Database connection
   ```

</details>

Finally, you can add a service for the frontend, using the Dockerfile you created in the `apps/frontend` and do the same
as before. The full solution can be found in the `apps/compose.prod.yaml` file on the `solutions` branch of this repo.
🖥️🐳

Now you can run the docker compose command to start the services:

```bash
docker compose -f apps/compose.prod.yaml up -d
```

Finally, go check your browser at `http://localhost:3000` to see the full app running! 🎉🚀
