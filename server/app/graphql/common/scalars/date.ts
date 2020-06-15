import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

export const Date = new GraphQLScalarType({
  name: 'Date',
  description: '日期',
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.getTime();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10);
    }
    return null;
  },
});