import { z } from 'zod'; 

const TaskPayload = z.object({
  title: z.string().describe("The title of the task."),
  description: z.string().describe("The description of the task."),
  dueDate: z.string().describe("The due date of the task."),
});

const ActionSchema = z.object({
  actionType: z.enum(["createTask", "updateTask", "deleteTask"]).describe("The type of action to be performed."),
  payload: TaskPayload.describe("The data associated with the action."),
}).describe("An individual action with its payload.");

const MessageSchema = z.object({
  action: ActionSchema.optional().describe("The action to be performed. Only perform an action if necessary."),
  message: z.string().describe("A message to be displayed to the user. This should be a response given the context of the conversation and if an action is performed, it should be a summary of the action."),
}).describe("A message with an action.");


 export default MessageSchema;

export const config = {"path":"message","public":true,"cache":"None","contentType":"text","model":"gpt-4o-mini","provider":"openai"};