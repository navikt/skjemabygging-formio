import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import employerBuilder from '../components/extensions/employer/Employer.builder';
import organizationNumberBuilder from '../components/extensions/organization-number/OrganizationNumber.builder';
import senderBuilder from '../components/extensions/sender/Sender.builder';

const organizationGroup = {
  title: 'Bedrift / organisasjon',
  components: {
    orgNr: organizationNumberBuilder(),
    Arbeidsgiver: employerBuilder(),
    senderOrganization: senderBuilder({
      label: 'Avsender organisasjon',
      senderRole: 'organization',
      customLabels: {
        organizationNumber: TEXTS.statiske.sender.organizationNumber,
        organizationName: TEXTS.statiske.sender.organizationName,
      },
    }),
  },
};

export default organizationGroup;
