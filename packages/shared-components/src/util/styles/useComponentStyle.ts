import { FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import makeStyles from '../../util/styles/jss/jss';

/**
 * Create default styles to use in our components.
 *
 * @param fieldSize
 * @param cssPath   Example: '& input' or '& .someClassName'
 */
const useComponentStyle = (fieldSize?: FieldSize, cssPath?: string) => {
  const getFieldSizeCss = () => {
    switch (fieldSize) {
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
      if (cssPath && css) {
        return {
          [cssPath]: css,
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
