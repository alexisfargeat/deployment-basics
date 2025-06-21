from typing import Generator

import pytest
from sqlmodel import Session, select
from fastapi.testclient import TestClient

from database import engine
from models import Todo
from main import app

@pytest.fixture(scope="session")
def session():
    # Create a new session directly using the engine
    with Session(engine) as session:
        yield session

@pytest.fixture(scope="function", autouse=True)
def autocleanup(session: Session):
    # Automatically clean up the database after each test
    todos = session.exec(select(Todo)).all()
    for todo in todos:
        session.delete(todo)

@pytest.fixture(scope="function")
def sample_todo(session) -> Generator[Todo, None, None]:

    new_todo = Todo(title="Test Todo", description="This is a test todo item.")
    session.add(new_todo)
    session.commit()
    session.refresh(new_todo)

    yield new_todo


client = TestClient(app)

class TestTodos:
    def test_get_todos(self, sample_todo: Todo):
        response = client.get("/todos")
        assert response.status_code == 200
        todos = response.json()
        assert isinstance(todos, list)
        assert all("id" in todo and "title" in todo for todo in todos)
        assert len(todos) == 1
        assert todos[0]["title"] == sample_todo.title
        assert todos[0]["description"] == sample_todo.description
        assert todos[0]["completed"] is False

    def test_create_todo(self):
        response = client.post("/todos", json={
            "title": "New Todo",
            "description": "This is a new todo item."
        })
        assert response.status_code == 200
        todo = response.json()
        assert "id" in todo
        assert todo["title"] == "New Todo"
        assert todo["description"] == "This is a new todo item."
        assert todo["completed"] is False


    def test_update_todo(self, sample_todo: Todo):
        response = client.patch(f"/todos/{sample_todo.id}", json={
            "title": "Updated Todo",
            "description": "This todo has been updated."
        })
        assert response.status_code == 200
        updated_todo = response.json()
        assert updated_todo["id"] == sample_todo.id
        assert updated_todo["title"] == "Updated Todo"
        assert updated_todo["description"] == "This todo has been updated."
        assert updated_todo["completed"] is False

    def test_delete_todo(self, sample_todo: Todo):
        response = client.delete(f"/todos/{sample_todo.id}")
        assert response.status_code == 204

        response = client.get(f"/todos/{sample_todo.id}")
        assert response.status_code == 404


