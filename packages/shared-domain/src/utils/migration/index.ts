import { combinePropAndOperator, getPropAndOperatorFromKey, isUnaryOperator } from './operatorUtils';

export type MigrationLevel = 'component' | 'form';

const migrationUtils = { combinePropAndOperator, getPropAndOperatorFromKey, isUnaryOperator };
export default migrationUtils;
