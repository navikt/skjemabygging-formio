import { Component, Form, Panel } from '../../models';
import { TEXTS } from '../../texts';
import { flattenComponents } from '../form/componentUtil';
import { createSendinnPaperCollection } from './sendinnPaperCollection';

interface SendinnPaperFormContext {
  attachmentFilter: readonly string[];
}

const toSendinnAttachment = (source: Component): Component => ({
  type: 'attachment',
  key: source.key,
  id: source.id,
  navId: source.navId,
  label: source.label,
  description: source.description,
  properties: source.properties,
  attachmentType: source.attachmentType,
  otherDocumentation: source.otherDocumentation,
  additionalDescriptionLabel: source.additionalDescriptionLabel,
  additionalDescriptionText: source.additionalDescriptionText,
  input: true,
  validate: { required: false },
  attachmentValues: { leggerVedNaa: { enabled: true } },
});

const createPanel = (key: string, label: string, components: Component[]): Panel => ({
  type: 'panel',
  key,
  label,
  title: label,
  components,
});

/**
 * Both server paths must pass the same normalized filter. Eligibility is checked against the
 * source's subsequentSubmissionTypes before using this paper-only definition.
 */
const convertToSendinnPaperForm = (source: Form, { attachmentFilter }: SendinnPaperFormContext): Form => {
  const form = structuredClone(source);
  const collection = createSendinnPaperCollection(form.properties);
  const allowedCodes = new Set(attachmentFilter);
  const attachments = flattenComponents(form.components)
    .filter((component) => component.type === 'attachment')
    .flatMap((component, index): Component[] =>
      allowedCodes.size === 0 || allowedCodes.has(component.properties?.vedleggskode?.trim() ?? '')
        ? [
            {
              type: 'container',
              // Keep source keys intact without colliding with collection fields or other source scopes.
              key: `sendinnAttachment${index + 1}`,
              label: '',
              input: true,
              tree: true,
              components: [toSendinnAttachment(component)],
            },
          ]
        : [],
    );
  const components = [
    ...(collection.length ? [createPanel('sendinnCollection', TEXTS.statiske.identity.submissionFor, collection)] : []),
    createPanel('sendinnAttachments', TEXTS.statiske.staticPdf.ettersendingTitle, attachments),
  ];

  return {
    ...form,
    properties: { ...form.properties, submissionTypes: ['PAPER'] },
    introPage: undefined,
    firstPanelSlug: components[0].key,
    components,
  };
};

export { convertToSendinnPaperForm };
export type { SendinnPaperFormContext };
