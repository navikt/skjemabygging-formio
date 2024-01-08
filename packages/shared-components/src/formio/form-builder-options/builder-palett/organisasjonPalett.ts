import employerBuilder from '../../components/extensions/employer/Employer.builder';
import organizationNumberBuilder from '../../components/extensions/organization-number/OrganizationNumber.builder';

const organisasjonPalett = {
  title: 'Bedrift / organisasjon',
  components: {
    orgNr: organizationNumberBuilder(),
    Arbeidsgiver: employerBuilder(),
  },
};

export default organisasjonPalett;
