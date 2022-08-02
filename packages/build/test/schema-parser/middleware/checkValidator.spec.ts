import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { CheckValidator } from '@vulcan-sql/build/schema-parser/middleware/checkValidator';
import { IValidatorLoader } from '@vulcan-sql/core';
import * as sinon from 'ts-sinon';

it('Should pass if there is no error', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [
      {
        validators: [{ name: 'validator1' }],
      },
    ],
  };
  const stubValidatorLoader = sinon.stubInterface<IValidatorLoader>();
  stubValidatorLoader.load.resolves({
    name: 'validator1',
    validateSchema: () => null,
    validateData: () => null,
  });
  const checkValidator = new CheckValidator(stubValidatorLoader);

  // Act Assert
  await expect(
    checkValidator.handle(schema, async () => Promise.resolve())
  ).resolves.not.toThrow();
});

it('Should throw if some validators have no name', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [
      {
        validators: [{ name: 'validator1' }, {}],
      },
    ],
  };
  const stubValidatorLoader = sinon.stubInterface<IValidatorLoader>();
  stubValidatorLoader.load.resolves({
    name: 'validator1',
    validateSchema: () => null,
    validateData: () => null,
  });
  const checkValidator = new CheckValidator(stubValidatorLoader);

  // Act Assert
  await expect(
    checkValidator.handle(schema, async () => Promise.resolve())
  ).rejects.toThrow('Validator name is required');
});

it('Should throw if the arguments of a validator is invalid', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [
      {
        validators: [{ name: 'validator1' }],
      },
    ],
  };
  const stubValidatorLoader = sinon.stubInterface<IValidatorLoader>();
  stubValidatorLoader.load.resolves({
    name: 'validator1',
    validateSchema: () => {
      throw new Error();
    },
    validateData: () => null,
  });
  const checkValidator = new CheckValidator(stubValidatorLoader);

  // Act Assert
  await expect(
    checkValidator.handle(schema, async () => Promise.resolve())
  ).rejects.toThrow();
});