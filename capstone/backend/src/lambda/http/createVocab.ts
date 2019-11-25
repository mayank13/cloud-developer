import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateVocabRequest } from '../../requests/CreateVocabRequest'
import { CreateVocab } from '../../businessLogic/vocab';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newVocab: CreateVocabRequest = JSON.parse(event.body);
  const createdVocab = await CreateVocab(newVocab, event);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item : createdVocab
    })
  };
}
