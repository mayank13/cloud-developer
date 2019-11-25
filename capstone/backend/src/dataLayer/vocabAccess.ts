import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { VocabItem } from "../models/VocabItem";
import * as AWS from "aws-sdk";
import { createLogger } from "../utils/logger";

export class VocabAccess {

    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3: AWS.S3 = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly vocabTable = process.env.VOCAB_TABLE,
        private readonly bucketName = process.env.IMAGES_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) { }
    
    async GenerateUrl(vocabId: string) {
        const logger = createLogger('generate-url');
        logger.info('Iside generat URL method'); 
        // Return the signed URL
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: vocabId,
            Expires: this.urlExpiration
          })
    }

    async DeleteItem(id: string, userId: string): Promise<VocabItem[]> {
        const logger = createLogger('delete-vocab');
        logger.info('Send this to the trash'); 

        await this.docClient.delete({
            TableName: this.vocabTable,
            Key: { "vocabId": id, 'userId': userId}
        }).promise()

        return [];
    }

    async CreateVocab(vocab: VocabItem): Promise<VocabItem> {
        const logger = createLogger('create-vocab');
        logger.info('Create a new ToDO item ', {...vocab});

        await this.docClient.put({
            TableName: this.vocabTable,
            Item: vocab
        }).promise();

        return vocab;
    }

    async UpdateVocab(id: string, userId: string,  vocab: VocabItem): Promise<VocabItem> {
        const logger = createLogger('update-vocab');
        logger.info('Updating a vocab item ', {...vocab});

        await this.docClient.update({
            TableName: this.vocabTable,
            Key: { 'vocabId': id, 'userId': userId },
            UpdateExpression: 'set #name = :n, done = :d, dueDate = :dt',
            ExpressionAttributeNames:{
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ':n' : vocab.name,
                ':d' : vocab.done,
                ':dt': vocab.dueDate
            },
            ReturnValues: 'UPDATED_NEW'
        }).promise()

        return vocab;
    }

    async GetItem(id: string, userId: string): Promise<VocabItem> {
        const logger = createLogger('get-item');
        logger.info('Getting signle vocab item');

        const result = await this.docClient.get({
            TableName: this.vocabTable,
            Key: { 'vocabId': id, 'userId': userId }
        }).promise();

        return result.Item as VocabItem;

    }

    async GetAllVocabs(userId: string): Promise<VocabItem[]> {
        const logger = createLogger('get-vocabs');
        logger.info('Getting all vocab items ');

        const result = await this.docClient.query({
            TableName: this.vocabTable,
            KeyConditionExpression: '#userId = :userId',
            ExpressionAttributeNames: {
                '#userId': 'userId',
            },
            ExpressionAttributeValues: {
                ':userId': userId,
            }
        }).promise();

        const items = result.Items;

        return items as VocabItem[];
    }

    async vocabExists(vocabId: string, userId: string): Promise<boolean> {
        const result = await this.docClient.get({
            TableName: this.vocabTable,
            Key: { "vocabId": vocabId, 'userId': userId}
        }).promise();

        return !!result.Item;
    }

}