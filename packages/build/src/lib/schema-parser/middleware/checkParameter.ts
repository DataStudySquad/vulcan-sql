import { AllTemplateMetadata, APISchema } from '@vulcan/core';
import { SchemaParserMiddleware } from './middleware';

export const checkParameter =
  (allMetadata: AllTemplateMetadata): SchemaParserMiddleware =>
  async (schemas, next) => {
    await next();
    const transformedSchemas = schemas as APISchema;
    const templateName = transformedSchemas.templateSource;
    const metadata = allMetadata[templateName];
    // Skip validation if no metadata found
    if (!metadata?.parameters) return;

    const parameters = metadata.parameters;
    parameters.forEach((parameter) => {
      // We only check the first value of nested parameters
      const name = parameter.name.split('.')[0];
      if (
        !transformedSchemas.request.some(
          (paramInSchema) => paramInSchema.fieldName === name
        )
      ) {
        throw new Error(
          `Parameter ${parameter.name} is not found in the schema.`
        );
      }
    });
  };
