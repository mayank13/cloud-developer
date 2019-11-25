import * as uuid from 'uuid';
import { VocabAccess } from '../dataLayer/vocabAccess';
import { VocabItem } from '../models/VocabItem';
import { CreateVocabRequest } from '../requests/CreateVocabRequest';
import { UpdateVocabRequest } from '../requests/UpdateVocabRequest';
import { getUserId } from '../lambda/utils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as moment from 'moment'

/**
 * Logic to perform CRUD on vocab
 */

const vocabAccess = new VocabAccess();
const bucketName = process.env.IMAGES_S3_BUCKET

export async function GenerateUrl(vocabId: string) {
    //Generate URL
    return vocabAccess.GenerateUrl(vocabId);
}

export async function deleteItem(id: string, event: APIGatewayProxyEvent): Promise<VocabItem[]> {
    const userId = getUserId(event); // get User Id
    return vocabAccess.DeleteItem(id, userId);
}

export async function getAllVocabs(event: APIGatewayProxyEvent): Promise<VocabItem[]> {
    const userId = getUserId(event);
    return vocabAccess.GetAllVocabs(userId);
}
/**
 * Get Item
 * @param id 
 * @param event 
 */
export async function getItem(id: string, event: APIGatewayProxyEvent): Promise<VocabItem> {
    const userId = getUserId(event);
    return vocabAccess.GetItem(id, userId);
}
/**
 * Update ToDo
 * @param id 
 * @param updatedVocab 
 * @param event 
 */
export async function UpdateVocab(
    id: string,
    updatedVocab: UpdateVocabRequest,
    event: APIGatewayProxyEvent
): Promise<VocabItem> {

    const userId = getUserId(event);
    const vocab: VocabItem = await vocabAccess.GetItem(id, userId);

    return await vocabAccess.UpdateVocab(id, userId, {
        vocabId: id,
        createdAt: vocab.createdAt,
        userId: vocab.userId,
        dueDate: updatedVocab.dueDate,
        name: updatedVocab.name,
        done: updatedVocab.done
    });
}

/**
 * Create To Do
 * @param createVocabRequest 
 * @param event 
 */
export async function CreateVocab(
    createVocabRequest: CreateVocabRequest,
    event: APIGatewayProxyEvent
): Promise<VocabItem> {

    const itemId = uuid.v4(); //uuid for the item
    const userId = getUserId(event);
    const isDone: boolean = Math.random() > .5 ? true : false;

    return await vocabAccess.CreateVocab({
        vocabId: itemId,
        userId: userId,
        name: createVocabRequest.name,
        createdAt: new Date().toISOString(),
        dueDate: moment().add(4, 'day').format('DD-MM-YYYY'), // Geneate a date in teh future
        done: isDone,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
    });
}