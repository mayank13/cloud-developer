import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateVocabRequest } from '../../requests/UpdateVocabRequest'
import { UpdateVocab } from '../../businessLogic/vocab';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const vocabId = event.pathParameters.vocabId
  const updatedVocab: UpdateVocabRequest = JSON.parse(event.body)

  const updatedItem = await UpdateVocab(vocabId, updatedVocab, event);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      updatedItem
    })
  };
}
