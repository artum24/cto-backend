import { registerEnumType } from '@nestjs/graphql';

export enum PhoneValidationValues {
  VALID = 'valid',
  INVALID = 'invalid',
}

registerEnumType(PhoneValidationValues, {
  name: 'PhoneValidationValues',
  description: 'Possible responses to phone validation',
});
