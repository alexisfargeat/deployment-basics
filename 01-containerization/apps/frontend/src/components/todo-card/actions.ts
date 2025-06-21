"use server";

import { revalidatePath } from "next/cache";

export async function changeCompletedStatus(todoId: string, newStatus: boolean) {
    const response = await fetch(`${process.env.API_URL}/todos/${todoId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: newStatus }),
    });

    if (!response.ok) {
        throw new Error("Failed to mark todo as done");
    }

    revalidatePath("/");
}
