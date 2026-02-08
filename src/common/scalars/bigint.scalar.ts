import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('BigInt', () => BigInt)
export class BigIntScalar implements CustomScalar<string, bigint> {
  description = 'BigInt serialized as string';

  parseValue(value: string | number): bigint {
    return BigInt(value);
  }

  serialize(value: bigint | number | string): string {
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'number') return Math.trunc(value).toString();
    return value.toString();
  }

  parseLiteral(ast: ValueNode): bigint {
    if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
      return BigInt(ast.value);
    }
    throw new Error(
      `BigIntScalar can only parse INT or STRING, got: ${ast.kind}`,
    );
  }
}
