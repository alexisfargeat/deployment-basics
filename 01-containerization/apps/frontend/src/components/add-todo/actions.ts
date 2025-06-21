"use server";

import { revalidatePath } from "next/cache";

export async function addTodo(title: string, description?: string) {
    const response = await fetch(`${process.env.API_URL}/todos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
        throw new Error("Failed to add todo");
    }

    revalidatePath("/");
}
