type JsonSchemaPrimitiveType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';

type JsonSchema = {
  $schema?: string;
  $id?: string;
  title?: string;
  description?: string;
  const?: string | number | boolean | null;
  type?: JsonSchemaPrimitiveType;
  format?: string;
  enum?: Array<string | number | boolean | null>;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  $comment?: string;
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
};

type JsonSchemaObject = JsonSchema & {
  type: 'object';
  properties: Record<string, JsonSchema>;
};

type SchemaGenerationContext = {
  formPath: string;
  revision?: number;
};

export type { JsonSchema, JsonSchemaObject, SchemaGenerationContext };
