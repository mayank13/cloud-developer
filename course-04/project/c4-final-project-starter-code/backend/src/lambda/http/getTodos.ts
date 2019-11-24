import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger';
import { getAllTodos } from '../../businessLogic/todo';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const logger = createLogger('get-todos');
  logger.info('Processing event ', event);

  const todos = await getAllTodos(event);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items: todos
    })
  };
}
