"use client";

import { addTodo } from "@/components/add-todo/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function AddTodoDialog() {
    const [open, setOpen] = React.useState(false);

    const formSchema = z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    });

    const onSubmit = async ({ title, description }: z.infer<typeof formSchema>) => {
        await addTodo(title, description);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus/> Add To Do</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Add a To Do</DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter the title of your todo" {...field} />
                                </FormControl>
                                <FormDescription>The title for your to do</FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <FormField name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a description" {...field} />
                                </FormControl>
                                <FormDescription>The description for your to do</FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <div className="flex justify-end">
                            <Button type="submit">Valider</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
