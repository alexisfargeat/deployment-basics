from typing import Optional

from sqlmodel import Field, SQLModel


class TodoBase(SQLModel):
    title: str
    description: str | None = None
    completed: bool = False


class Todo(TodoBase, table=True):
    id: int | None = Field(default=None, primary_key=True)


class TodoCreate(TodoBase):
    pass


class TodoUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


class TodoRead(TodoBase):
    id: int
