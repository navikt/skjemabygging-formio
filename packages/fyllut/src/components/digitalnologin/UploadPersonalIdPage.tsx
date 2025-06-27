import { BodyShort, Box, Button, Heading, Tag } from '@navikt/ds-react';
import { FormContainer, LanguageSelector } from '@navikt/skjemadigitalisering-shared-components';
import AttachmentUpload from './AttachmentUpload';

const radioOptions = [
  { value: 'norwegian-passport', label: 'Norsk pass', upload: true },
  { value: 'foreign-passport', label: 'Utenlandsk pass (ikke nødpass)', upload: true },
  { value: 'national-id-eu', label: 'Nasjonalt ID-kort fra EU/EØS-land og Sveits', upload: true },
  { value: 'drivers-license', label: 'Norsk førerkort utstedt fra og med 01.01.1998', upload: true },
  { value: 'drivers-license-eu', label: 'Førerkort utstedt i EU/EØS og som følger EU/EØS reglene', upload: true },
];

const UploadPersonalIdPage = () => {
  const handleUpload = (value: string) => {
    console.log('Uploading', value);
  };

  return (
    <>
      <FormContainer>
        <LanguageSelector />
      </FormContainer>
      <FormContainer small={true}>
        {/* Replace whole Box with <FormTitle /> when we have form */}
        <Box paddingBlock="6">
          <BodyShort textColor="subtle" spacing>
            Søknad om alderspensjon og AFP i privat sektor
          </BodyShort>
          <Heading level="1" size="xlarge">
            Legitimasjon
          </Heading>
          <Tag variant="neutral-moderate" size="small">
            NAV 19-01.05
          </Tag>
        </Box>
        <AttachmentUpload
          label={'Hvilken legitimasjon ønsker du å bruke?'}
          options={radioOptions}
          vedleggId={'personal-id'}
          onUpload={handleUpload}
        />
        <nav>
          <div className="button-row button-row--center">
            <Button variant="primary" icon={<span aria-hidden className="navds-icon navds-icon--arrow-right" />}>
              Fortsett
            </Button>
            <Button variant="secondary" icon={<span aria-hidden className="navds-icon navds-icon--arrow-left" />}>
              Gå tilbake
            </Button>
            <Button variant="tertiary">Avbryt og slett</Button>
          </div>
        </nav>
      </FormContainer>
    </>
  );
};

export default UploadPersonalIdPage;
