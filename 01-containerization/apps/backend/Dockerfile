FROM python:3.13-alpine

WORKDIR /app

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Create a non-root user.
RUN addgroup --system --gid 1001 appgroup
RUN adduser --system --uid 1001 --ingroup appgroup appuser

# Copy the application into the container.
COPY --chown=appuser:appgroup . .

# Install the application dependencies.
RUN uv sync --locked

# Switch to a non-root user created above.
USER appuser

# We expose the port that the application will run on.
EXPOSE 8000

# Run the application.
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
