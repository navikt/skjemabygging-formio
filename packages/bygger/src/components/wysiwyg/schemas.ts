import { defineSchema } from '@portabletext/editor';
import { Schema } from '@sanity/schema';

export const editorSchema = Schema.compile({
  name: 'myText',
  types: [
    {
      type: 'array',
      name: 'editorText',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 1', value: 'h1' },
            { title: 'Heading 2', value: 'h2' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'Lenke' },
                  // { name: 'title', type: 'string', title: 'Title' },
                  // { name: 'openInNewTab', type: 'boolean', title: 'Åpne i ny fane' },
                ],
              },
            ],
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        },
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
