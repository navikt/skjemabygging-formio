import { defineSchema } from '@portabletext/editor';
import { Schema } from '@sanity/schema';

export const editorSchema = Schema.compile({
  name: 'wysiwyg',
  types: [
    {
      type: 'object',
      name: 'editor',
      fields: [
        {
          title: 'Body',
          name: 'body',
          type: 'array',
          of: [{ type: 'block' }],
        },
        // {
        //   title: 'link',
        //   name: 'a',
        //   type: 'annotation',
        //   of: [{ type: 'link' }],
        // },
      ],
    },
  ],
});

export const schemaDefinition = defineSchema({
  decorators: [{ name: 'strong', title: 'B' }],
  annotations: [{ name: 'link', title: 'Lenke', fields: [{ name: 'href', type: 'string' }] }],
  styles: [
    { name: 'p', title: 'Avsnitt' },
    { name: 'h3', title: 'Overskrift' },
    { name: 'h4', title: 'Underoverskrift ' },
  ],
  lists: [
    { name: 'bullet', title: 'Bulleted List' },
    { name: 'number', title: 'Numbered List' },
  ],
  inlineObjects: [
    {
      name: 'link',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'url', type: 'string' },
        { name: 'openInNewTab', type: 'boolean' },
      ],
    },
  ],
});
