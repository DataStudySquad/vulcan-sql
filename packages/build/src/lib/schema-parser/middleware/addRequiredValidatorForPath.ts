import { FieldInType } from '@vulcan/core';
import { SchemaParserMiddleware } from './middleware';

// Add the "required" validator when the parameters are in path
export const addRequiredValidatorForPath =
  (): SchemaParserMiddleware => async (schemas, next) => {
    await next();
    const requests = schemas.request || [];
    for (const request of requests) {
      if (request.fieldIn !== FieldInType.PATH) continue;
      if (!request.validators) request.validators = [];
      if (
        !request.validators?.some(
          (validator) => (validator as any).name === 'required'
        )
      ) {
        request.validators?.push({
          name: 'required',
          args: {},
        });
      }
    }
  };
