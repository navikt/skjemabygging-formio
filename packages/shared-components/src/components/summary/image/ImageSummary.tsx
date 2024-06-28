import { SummaryImage } from '@navikt/skjemadigitalisering-shared-domain';
import makeStyles from '../../../util/styles/jss/jss';

const useImgSummaryStyles = (widthPercent) => {
  return makeStyles({
    description: { minWidth: 100, maxWidth: widthPercent + '%' },
  })();
};

interface Props {
  component: SummaryImage;
}

const ImageSummary = ({ component }: Props) => {
  const { label, value, alt, widthPercent } = component;
  const { description } = useImgSummaryStyles(widthPercent);
  return (
    <>
      <dt>{label}</dt>
      <dd>
        <img className={description} src={value} alt={alt}></img>
      </dd>
    </>
  );
};
export default ImageSummary;
