import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';

const UploadPersonalIdButtonRow = () => {
  const navigate = useNavigate();
  const { baseUrl } = useAppConfig();
  const { translate } = useLanguages();
  const { form, formUrl } = useForm();
  const [searchParams] = useSearchParams();

  const startUrl = `${baseUrl}${formUrl}/${form.firstPanelSlug}`;

  const navigateToFormPage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // TODO: stop if file has not been uploaded
    navigate(`../${form.firstPanelSlug}?${searchParams.toString()}`);
  };

  return (
    <nav>
      <div className="button-row button-row--center">
        <Button
          variant="primary"
          icon={<ArrowRightIcon aria-hidden />}
          iconPosition="right"
          as="a"
          onClick={navigateToFormPage}
          role="link"
          {...{ href: `${startUrl}?${searchParams.toString()}` }}
        >
          {translate(TEXTS.grensesnitt.navigation.next)}
        </Button>
        <Button
          variant="secondary"
          icon={<ArrowLeftIcon aria-hidden />}
          iconPosition="left"
          onClick={() => navigate(-1)}
        >
          {translate(TEXTS.grensesnitt.goBack)}
        </Button>
      </div>
      <div className="button-row button-row--center">
        <Button
          variant="tertiary"
          onClick={(event) => {
            // TODO: Implement delete file logic
            console.log('Should delete file and navigate away', event);
          }}
        >
          {translate(TEXTS.grensesnitt.navigation.cancelAndDelete)}
        </Button>
      </div>
    </nav>
  );
};

export default UploadPersonalIdButtonRow;
