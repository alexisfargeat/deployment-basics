# Todo Backend

## How to run

### Pre-requisites

1. Make sure you have `uv` installed. If not, you can install it using the
   instructions [here](https://docs.astral.sh/uv/getting-started/installation/)
2. Install the dependencies by running:
   ```bash
   uv sync 
   ```
3. To use the database, you need to have a PostgreSQL server running, which can be done using the compose file provided
   in the `apps` folder :
    ```bash
   docker compose up -d
    ```
4. Create a `.env` file in the `apps/backend` directory based on the contents of the provided `.env.example` file.
   Make sure to set the `DATABASE_URL` to point to your PostgreSQL server. If you are using the Docker Compose setup,
   it should look like this:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/todo
   ```

### Development mode

To run the backend in development mode, you can use the following command in the `apps/backend` directory:

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production mode

To run the backend in production mode, you can use the following command in the `apps/backend` directory:

```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

### Testing

To run the tests, you need to install all the dev dependencies first, which can be done by running:

```bash
uv sync --group dev
```

Then, you can run the tests using the following command in the `apps/backend` directory:

```bash
uv run pytest
```

Or with coverage:

```bash
uv run pytest --cov --cov-report term --cov-report xml:coverage.xml --junitxml=report.xml
```
