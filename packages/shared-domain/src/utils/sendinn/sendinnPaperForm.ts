import { createContainer, createPanel } from '../../form-components';
import { Component, Form } from '../../models';
import { TEXTS } from '../../texts';
import { createAttachmentCodeFilter } from '../attachment/attachmentCodeFilter';
import { flattenComponents } from '../form/componentUtil';
import { createSendinnUserTypeComponents } from './sendinnUserType';

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

const createSendinnPanel = (key: string, label: string, components: Component[]): Component =>
  createPanel({ key, label, title: label, components });

/**
 * Both server paths must pass the same normalized filter. Eligibility is checked against the
 * source's subsequentSubmissionTypes before using this paper-only definition.
 */
const convertToSendinnPaperForm = (source: Form, { attachmentFilter }: SendinnPaperFormContext): Form => {
  const form = structuredClone(source);
  const userTypeComponents = createSendinnUserTypeComponents(form.properties);
  const matchesAttachmentCode = createAttachmentCodeFilter(attachmentFilter);
  const attachments = flattenComponents(form.components)
    .filter((component) => component.type === 'attachment')
    .flatMap((component, index): Component[] =>
      matchesAttachmentCode(component)
        ? [
            createContainer({
              // Keep source keys intact without colliding with user type fields or other source scopes.
              key: `sendinnAttachment${index + 1}`,
              label: '',
              components: [toSendinnAttachment(component)],
            }),
          ]
        : [],
    );
  const components = [
    ...(userTypeComponents.length
      ? [createSendinnPanel('sendinnUserType', TEXTS.statiske.identity.submissionFor, userTypeComponents)]
      : []),
    createSendinnPanel('sendinnAttachments', TEXTS.statiske.staticPdf.ettersendingTitle, attachments),
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
