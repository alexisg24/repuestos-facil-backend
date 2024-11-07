import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { POSTGRES_ERROR_CODES } from '../constants/POSTGRES_ERROR_CODES';

@Catch(QueryFailedError)
export class TypeOrmCustomExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const exceptionCode = (exception.driverError as any).code;
    const exceptionDetails = (exception.driverError as any).detail;

    if (exceptionCode && exceptionDetails) {
      if (exceptionCode === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
        return response.status(400).json({
          status: 400,
          message: `This field is already in use - ${exceptionDetails}`,
        });
      }
    }

    console.log('QueryFailedError', exception);

    return response.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
}
