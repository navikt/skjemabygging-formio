import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';
import makeStyles from '../../util/styles/jss/jss';

interface Props {
  heightOffsetRem?: number;
}

const useLoadingStyles = makeStyles<'root', Props>({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: ({ heightOffsetRem = 0 }) => `calc(100vh - ${heightOffsetRem}rem)`,
    '& h1': {
      fontSize: '3rem',
      fontWeight: 'bolder',
    },
  },
});

const LoadingComponent = ({ heightOffsetRem = 0 }: Props) => {
  const { translate } = useLanguages();
  const classes = useLoadingStyles({ heightOffsetRem });
  return (
    <div className={classes.root}>
      <h1>{translate ? translate(TEXTS.statiske.loading) : TEXTS.statiske.loading}</h1>
    </div>
  );
};

export default LoadingComponent;
