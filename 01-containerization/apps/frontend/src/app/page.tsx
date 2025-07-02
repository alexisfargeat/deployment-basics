import { AddTodoDialog } from "@/components/add-todo/dialog";
import { TodoCard } from "@/components/todo-card";
import { Todo } from "@/lib/types";

export const dynamic = "force-dynamic";
export default async function Home() {
    let todos: Todo[] = [];
    let error = false;

    try {
        const todosResult = await fetch(`${process.env.API_URL}/todos`,);

        if (!todosResult.ok) {
            console.error(todosResult.status);
            error = true;
        }

        todos = await todosResult.json();
    } catch (err) {
        console.error(err);
        error = true;
    }

    return (
        <div
            className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
                <div className="flex justify-between w-full items-center">
                    <h1 className="text-2xl font-bold">To Do app</h1>
                    <AddTodoDialog/>
                </div>
                {error && <div className="text-red-500">Failed to load todos. Please try again later.</div>}
                <div className="flex flex-col gap-4 w-full">
                    {todos.map((todo) => (
                        <TodoCard todo={todo} key={todo.id}/>
                    ))}
                </div>
            </main>
        </div>
    );
}
