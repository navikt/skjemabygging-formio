import { useEffect } from 'react';
import makeStyles from '../../../util/styles/jss/jss';

const useStyles = makeStyles({
  uxsignals: {
    maxWidth: '640px',
  },
});

interface Props {
  id: string;
  demo: boolean;
}

const LetterUXSignals = ({ id, demo = false }: Props) => {
  const classes = useStyles();
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.uxsignals.com/embed.js';
    script.type = 'module';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section>
      <div data-uxsignals-embed={id} data-uxsignals-mode={demo ? 'demo' : ''} className={classes.uxsignals} />
    </section>
  );
};

export default LetterUXSignals;
