import { Summary } from "@navikt/skjemadigitalisering-shared-domain";
import makeStyles from "../../util/jss";

const useImgSummaryStyles = (widthPercent) => {
  return makeStyles({
    description: { minWidth: 100, maxWidth: widthPercent + "%" },
  })();
};

interface Props {
  component: Summary.Image;
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
