"use client"

import { changeCompletedStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Todo } from "@/lib/types";
import { Check } from "lucide-react";

export function TodoCard({ todo }: {todo: Todo}) {
  return (
      <Card>
          <CardHeader className="flex justify-between items-center">
              <CardTitle>{todo.title}</CardTitle>
              <Button onClick={() => changeCompletedStatus(todo.id, !todo.completed)} className={todo.completed ? "bg-green-400 hover:bg-green-500" : ""} size="sm">
                  {todo.completed ? <span className="flex items-center gap-1"><Check/>Done</span> : <span>Mark as done</span>}
              </Button>
          </CardHeader>
          <CardContent>
              {todo.description}
          </CardContent>
      </Card>
  );
}
