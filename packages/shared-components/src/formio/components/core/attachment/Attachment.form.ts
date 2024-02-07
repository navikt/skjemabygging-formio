import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';

const attachmentForm = () => {
  const { api, conditional, createTabs, display, validation, data } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.label(),
      editFormDisplay.description(),
      editFormDisplay.additionalDescription(),
    ]),
    data([
      {
        type: 'container',
        key: 'attachmentValues',
        label: 'Velg innsendingsalternativer for dette vedlegget',
        components: [{
          type: 'container',
          key: 'leggerVedNaa',
          label: '',
          hideLabel: true,
          components: [{
            type: 'checkbox',
            key: 'enabled',
            label: 'Jeg laster opp dette nå / Jeg legger det ved dette skjemaet',
          }, {
            type: 'fieldset',
            key: 'leggerVedNaaGroup',
            label: 'Test',
            customClass: 'ml',
            customConditional: 'show = data?.attachmentValues?.leggerVedNaa?.enabled === true',
            components: [{
              type: 'checkbox',
              key: 'showDeadline',
              label: 'Informér bruker om ettersendelsesfrist (settes i skjemainnstillinger)',
            }, {
              type: 'container',
              key: 'additionalDocumentation',
              label: '',
              components: [{
                type: 'checkbox',
                key: 'enabled',
                label: 'Bruker må oppgi tilleggsinformasjon',
              }, {
                type: 'textfield',
                key: 'label',
                customClass: 'ml',
                label: 'Ledetekst for tilleggsinformasjon',
                customConditional: 'show = data?.attachmentValues?.leggerVedNaa?.additionalDocumentation?.enabled === true',
              }, {
                type: 'textfield',
                key: 'description',
                customClass: 'ml',
                label: 'Beskrivelse av krav til tilleggsinformasjon',
                customConditional: 'show = data?.attachmentValues?.leggerVedNaa?.additionalDocumentation?.enabled === true',
              }],
            }],
          }],
        }, {
          type: 'container',
          key: 'ettersender',
          label: '',
          hideLabel: true,
          components: [{
            type: 'checkbox',
            key: 'enabled',
            label: 'Jeg laster opp dette senere / Jeg ettersender dokumentasjonen senere',
          }],
        }, {
          type: 'container',
          key: 'nei',
          label: '',
          hideLabel: true,
          components: [{
            type: 'checkbox',
            key: 'enabled',
            label: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved',
          }],
        }, {
          type: 'container',
          key: 'levertTidligere',
          label: '',
          hideLabel: true,
          components: [{
            type: 'checkbox',
            key: 'enabled',
            label: 'Jeg har levert denne dokumentasjonen tidligere',
          }],
        }, {
          type: 'container',
          key: 'harIkke',
          label: '',
          hideLabel: true,
          components: [{
            type: 'checkbox',
            key: 'enabled',
            label: 'Jeg har ikke denne dokumentasjonen',
          }],
        }, {
          type: 'container',
          key: 'andre',
          label: '',
          hideLabel: true,
          components: [{
            type: 'checkbox',
            key: 'enabled',
            label: 'Sendes inn av andre (for eksempel lege, arbeidsgiver)',
          }],
        }, {
          type: 'container',
          key: 'nav',
          label: '',
          hideLabel: true,
          components: [{
            type: 'checkbox',
            key: 'enabled',
            label: 'Jeg ønsker at NAV innhenter denne dokumentasjonen',
          }],
        }],
      },
      editFormData.values(),
    ]),
    validation([
      editFormValidation.required(),
    ]),
    api([
      editFormApi.key(),
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default attachmentForm;
