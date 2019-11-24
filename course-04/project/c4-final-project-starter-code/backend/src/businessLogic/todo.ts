import * as uuid from 'uuid';
import { TodoAccess } from '../dataLayer/todoAccess';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { getUserId } from '../lambda/utils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as moment from 'moment'

/**
 * Logic to perform CRUD on todo
 */

const todoAccess = new TodoAccess();
const bucketName = process.env.IMAGES_S3_BUCKET

export async function GenerateUrl(todoId: string) {
    //Generate URL
    return todoAccess.GenerateUrl(todoId);
}

export async function deleteItem(id: string, event: APIGatewayProxyEvent): Promise<TodoItem[]> {
    const userId = getUserId(event); // get User Id
    return todoAccess.DeleteItem(id, userId);
}

export async function getAllTodos(event: APIGatewayProxyEvent): Promise<TodoItem[]> {
    const userId = getUserId(event);
    return todoAccess.GetAllTodos(userId);
}
/**
 * Get Item
 * @param id 
 * @param event 
 */
export async function getItem(id: string, event: APIGatewayProxyEvent): Promise<TodoItem> {
    const userId = getUserId(event);
    return todoAccess.GetItem(id, userId);
}
/**
 * Update ToDo
 * @param id 
 * @param updatedTodo 
 * @param event 
 */
export async function UpdateTodo(
    id: string,
    updatedTodo: UpdateTodoRequest,
    event: APIGatewayProxyEvent
): Promise<TodoItem> {

    const userId = getUserId(event);
    const todo: TodoItem = await todoAccess.GetItem(id, userId);

    return await todoAccess.UpdateTodo(id, userId, {
        todoId: id,
        createdAt: todo.createdAt,
        userId: todo.userId,
        dueDate: updatedTodo.dueDate,
        name: updatedTodo.name,
        done: updatedTodo.done
    });
}

/**
 * Create To Do
 * @param createTodoRequest 
 * @param event 
 */
export async function CreateTodo(
    createTodoRequest: CreateTodoRequest,
    event: APIGatewayProxyEvent
): Promise<TodoItem> {

    const itemId = uuid.v4(); //uuid for the item
    const userId = getUserId(event);
    const isDone: boolean = Math.random() > .5 ? true : false;

    return await todoAccess.CreateTodo({
        todoId: itemId,
        userId: userId,
        name: createTodoRequest.name,
        createdAt: new Date().toISOString(),
        dueDate: moment().add(4, 'day').format('DD-MM-YYYY'), // Geneate a date in teh future
        done: isDone,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
    });
}