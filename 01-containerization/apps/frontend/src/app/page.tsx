import { AddTodoDialog } from "@/components/add-todo/dialog";
import { TodoCard } from "@/components/todo-card";
import { Todo } from "@/lib/types";

export default async function Home() {
    const todos: Todo[] = await (await fetch(`${process.env.API_URL}/todos`)).json();

    return (
        <div
            className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
                <div className="flex justify-between w-full items-center">
                    <h1 className="text-2xl font-bold">To Do app</h1>
                    <AddTodoDialog/>
                </div>
                <div className="flex flex-col gap-4 w-full">
                    {todos.map((todo) => (
                        <TodoCard todo={todo} key={todo.id}/>
                    ))}
                </div>
            </main>
        </div>
    );
}
