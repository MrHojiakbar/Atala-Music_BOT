import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {    
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const data = exception.getResponse();
    const status = exception.getStatus();
    console.log({
      statusCode: status,
      message: data.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
    
    // response.status(status).json({
    //   statusCode: status,
    //   message: data.message,
    //   timestamp: new Date().toISOString(),
    //   path: request.url,
    // });
  }
}
