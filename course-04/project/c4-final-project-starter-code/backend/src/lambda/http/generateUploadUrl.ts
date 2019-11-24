import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { GenerateUrl } from '../../businessLogic/todo';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const url = await GenerateUrl(todoId);

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers':'*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  };
}
