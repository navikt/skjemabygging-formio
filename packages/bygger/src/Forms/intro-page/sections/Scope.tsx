import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { Fragment } from 'react';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../components/AddButton';
import { SectionErrorMessage } from '../components/SectionErrorMessage';
import { TextareaField } from '../components/TextareaField';
import { addBulletPoint, handleBulletPointChange, removeBulletPoint, updateSection } from '../utils';
import { IntroPageRefs } from '../validation/useIntroPageRefs';
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  form: Form;
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
  refMap: IntroPageRefs;
};

export function Scope({ form, handleChange, errors, refMap }: Props) {
  const showIngress = form.introPage?.sections?.scope?.description !== undefined;
  const bulletPoints = form.introPage?.sections?.scope?.bulletPoints || [];
  const showAddBulletList = bulletPoints.length === 0;

  return (
    <SectionWrapper
      data-testid="scope"
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Beskriv hva skjemaet kan brukes til
          </Heading>
          <RadioGroup
            legend="Velg overskrift"
            defaultValue={form.introPage?.sections?.scope?.title}
            onChange={(value) => handleChange(updateSection(form, 'scope', 'title', value))}
            error={errors?.sections?.scope?.title}
          >
            <Radio value="introPage.scope.title.alt1" ref={refMap['sections.scope.title']}>
              Her kan du søke om
            </Radio>
            <Radio value="introPage.scope.title.alt2">Her kan du melde om</Radio>
            <Radio value="introPage.scope.title.alt3">Her kan du</Radio>
          </RadioGroup>
          <Box>
            {!showIngress && (
              <AddButton
                label={'Legg til ingress'}
                onClick={() => handleChange(updateSection(form, 'scope', 'description', ''))}
              />
            )}
            {showAddBulletList && (
              <AddButton
                label={'Legg til punktliste'}
                onClick={() => handleChange(addBulletPoint(form, 'scope', ''))}
              />
            )}
            {showIngress && (
              <TextareaField
                value={form?.introPage?.sections.scope?.description || ''}
                label="Ingress"
                onChange={(value) => handleChange(updateSection(form, 'scope', 'description', value))}
                showDeleteButton
                onDelete={() => {
                  handleChange(updateSection(form, 'scope', 'description', undefined));
                }}
                error={errors?.sections?.scope?.description}
                ref={refMap['sections.scope.description']}
              />
            )}
          </Box>

          {!!form.introPage?.sections?.scope?.bulletPoints?.length && (
            <>
              {form.introPage?.sections?.scope?.bulletPoints?.map((bullet, index) => (
                <Fragment key={index}>
                  <TextareaField
                    value={bullet}
                    label="Kulepunkt"
                    onChange={(value) => handleChange(handleBulletPointChange(form, 'scope', index, value))}
                    showDeleteButton
                    onDelete={() => handleChange(removeBulletPoint(form, 'scope', index))}
                    error={errors?.sections?.scope?.bulletPoints?.[index]}
                    ref={refMap['sections.scope.bulletPoints'][index]}
                  />
                </Fragment>
              ))}
              <AddButton
                label={'Legg til kulepunkt'}
                variant="tertiary"
                onClick={() => handleChange(addBulletPoint(form, 'scope', ''))}
              />
            </>
          )}
          <SectionErrorMessage errorMessage={errors?.sections?.scope?.message} />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}
