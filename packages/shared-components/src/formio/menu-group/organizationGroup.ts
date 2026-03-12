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
      labels: {
        organizationNumber: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
        organizationName: 'Virksomhetens navn',
      },
    }),
  },
};

export default organizationGroup;
