from typing import Sequence, Optional
from fastapi import FastAPI, Depends, Query, HTTPException
from sqlmodel import Session, select
from contextlib import asynccontextmanager
from database import create_db_and_tables, get_session
from models import TodoRead, Todo, TodoCreate, TodoUpdate


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/todos", response_model=list[TodoRead])
def read_todos(
    limit: int = Query(default=20, le=50),
    offset: int = 0,
    session: Session = Depends(get_session),
) -> Sequence[Todo]:
    return session.exec(
        select(Todo).order_by(Todo.id).limit(limit).offset(offset)
    ).all()


@app.post("/todos", response_model=TodoRead)
def create_todo(todo: TodoCreate, session: Session = Depends(get_session)) -> Todo:
    db_todo = Todo.model_validate(todo)
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo


@app.patch("/todos/{todo_id}", response_model=TodoRead)
def update_todo(
    todo_id: int, todo: TodoUpdate, session: Session = Depends(get_session)
) -> Todo:
    db_todo: Optional[Todo] = session.get(Todo, todo_id)
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo_data = todo.model_dump(exclude_unset=True)
    db_todo.sqlmodel_update(todo_data)
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo


@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int, session: Session = Depends(get_session)):
    db_todo = session.get(Todo, todo_id)
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    session.delete(db_todo)
    session.commit()
    return
