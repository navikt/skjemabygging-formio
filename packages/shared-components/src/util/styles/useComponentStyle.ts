import { FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import makeStyles from '../../util/styles/jss/jss';

interface Options {
  fieldSize?: FieldSize;
  cssSelector?: string;
}

/**
 * Create default styles to use in our components.
 *
 * @param options Example of options.fieldSize: '& input' or '& .someClassName'
 */
const useComponentStyle = (options: Options) => {
  const getFieldSizeCss = () => {
    switch (options.fieldSize) {
      case 'xxsmall':
        return {
          width: '35px',
        };
      case 'xsmall':
        return {
          width: '70px',
        };
      case 'small':
        return {
          width: '140px',
        };
      case 'medium':
        return {
          width: '210px',
        };
      case 'large':
        return {
          width: '280px',
        };
      case 'xlarge':
        return {
          width: '100%',
          minWidth: '300px',
          maxWidth: '350px',
        };
      case 'xxlarge':
        return {
          width: '100%',
          minWidth: '300px',
          maxWidth: '420px',
        };
      default:
        return undefined;
    }
  };
  const useStyles = makeStyles({
    fieldSize: () => {
      const css = getFieldSizeCss();
      if (options.cssSelector && css) {
        return {
          [options.cssSelector]: css,
        };
      }

      return css;
    },
  });

  const styles = useStyles();

  return {
    fieldSize: styles.fieldSize,
  };
};

export default useComponentStyle;
