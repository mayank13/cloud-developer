import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItem } from "../models/TodoItem";
import * as AWS from "aws-sdk";
import { createLogger } from "../utils/logger";

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3: AWS.S3 = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly todoTable = process.env.TODO_TABLE,
        private readonly bucketName = process.env.IMAGES_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) { }
    
    async GenerateUrl(todoId: string) {
        const logger = createLogger('generate-url');
        logger.info('Iside generat URL method'); 
        // Return the signed URL
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.urlExpiration
          })
    }

    async DeleteItem(id: string, userId: string): Promise<TodoItem[]> {
        const logger = createLogger('delete-todo');
        logger.info('Send this to the trash'); 

        await this.docClient.delete({
            TableName: this.todoTable,
            Key: { "todoId": id, 'userId': userId}
        }).promise()

        return [];
    }

    async CreateTodo(todo: TodoItem): Promise<TodoItem> {
        const logger = createLogger('create-todo');
        logger.info('Create a new ToDO item ', {...todo});

        await this.docClient.put({
            TableName: this.todoTable,
            Item: todo
        }).promise();

        return todo;
    }

    async UpdateTodo(id: string, userId: string,  todo: TodoItem): Promise<TodoItem> {
        const logger = createLogger('update-todo');
        logger.info('Updating a todo item ', {...todo});

        await this.docClient.update({
            TableName: this.todoTable,
            Key: { 'todoId': id, 'userId': userId },
            UpdateExpression: 'set #name = :n, done = :d, dueDate = :dt',
            ExpressionAttributeNames:{
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ':n' : todo.name,
                ':d' : todo.done,
                ':dt': todo.dueDate
            },
            ReturnValues: 'UPDATED_NEW'
        }).promise()

        return todo;
    }

    async GetItem(id: string, userId: string): Promise<TodoItem> {
        const logger = createLogger('get-item');
        logger.info('Getting signle todo item');

        const result = await this.docClient.get({
            TableName: this.todoTable,
            Key: { 'todoId': id, 'userId': userId }
        }).promise();

        return result.Item as TodoItem;

    }

    async GetAllTodos(userId: string): Promise<TodoItem[]> {
        const logger = createLogger('get-todos');
        logger.info('Getting all todo items ');

        const result = await this.docClient.query({
            TableName: this.todoTable,
            KeyConditionExpression: '#userId = :userId',
            ExpressionAttributeNames: {
                '#userId': 'userId',
            },
            ExpressionAttributeValues: {
                ':userId': userId,
            }
        }).promise();

        const items = result.Items;

        return items as TodoItem[];
    }

    async todoExists(todoId: string, userId: string): Promise<boolean> {
        const result = await this.docClient.get({
            TableName: this.todoTable,
            Key: { "todoId": todoId, 'userId': userId}
        }).promise();

        return !!result.Item;
    }

}