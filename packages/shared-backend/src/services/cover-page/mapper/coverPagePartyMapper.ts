import {
  CoverPageDownloadType,
  Form,
  formatUtils,
  isSenderOrganization,
  navFormUtils,
  Party,
  ResponseError,
  SubmissionData,
} from '@navikt/skjemadigitalisering-shared-domain';

type CoverPagePartyData = {
  user?: CoverPageDownloadType['user'];
  navUnit?: string;
};

type OrganizationNumberUser = Extract<CoverPageDownloadType['user'], { organizationNumber: string }>;

const getCoverPageOrganizationUser = (form: Form, submission: SubmissionData): OrganizationNumberUser | undefined => {
  const organizationNumberComponent = navFormUtils
    .flattenComponents(form.components)
    .find((component) => component.type === 'orgNr' && component.coverPageUser && submission[component.key]);

  if (!organizationNumberComponent) {
    return undefined;
  }

  const organizationNumber = submission[organizationNumberComponent.key];
  if (!organizationNumber) {
    return undefined;
  }

  const organizationNumberValue = formatUtils.removeAllSpaces(`${organizationNumber}`);
  if (!organizationNumberValue) {
    return undefined;
  }

  return {
    organizationNumber: organizationNumberValue,
  };
};

const mapPartyToCoverPage = (party: Party): CoverPagePartyData => {
  if (party.onBehalfOf === 'multiple-people') {
    return { navUnit: party.navUnit };
  }

  if (isSenderOrganization(party.user)) {
    return {
      user: {
        organizationNumber: formatUtils.removeAllSpaces(party.user.number),
      },
    };
  }

  if (party.user.kind === 'identified-person') {
    return {
      user: {
        nationalIdentityNumber: party.user.nationalIdentityNumber,
      },
    };
  }

  if (!party.user.address) {
    throw new ResponseError('BAD_REQUEST', 'User needs to submit either identification number or address');
  }

  return {
    user: {
      firstName: party.user.firstName ?? '',
      surname: party.user.surname ?? '',
      address: party.user.address ?? {},
    },
  };
};

export { getCoverPageOrganizationUser, mapPartyToCoverPage };
export type { CoverPagePartyData };
