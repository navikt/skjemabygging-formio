import { DetailedHTMLProps, HTMLAttributes } from 'react';
import styles from './SkyraSurvey.module.css';

type SkyraSurveyElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  slug: string;
};

declare module 'react' {
  // Registers the Skyra custom element so TSX accepts it. Module augmentation requires a namespace here.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'skyra-survey': SkyraSurveyElementProps;
    }
  }
}

interface SkyraSurveyProps {
  slug?: string;
}

/**
 * Renders a Skyra inline survey (https://www.skyra.no/no/help/publiserer-en-inline-survey-embedded).
 *
 * The host page must load the Skyra script. On nav.no the decorator loads it, but only for users who have
 * consented to surveys. Until the script has loaded, or when Skyra decides not to show the survey, the custom
 * element stays empty and takes up no space.
 */
const SkyraSurvey = ({ slug }: SkyraSurveyProps) => {
  const trimmedSlug = slug?.trim();

  if (!trimmedSlug) {
    return null;
  }

  return (
    <div className={styles.root}>
      <skyra-survey slug={trimmedSlug} />
    </div>
  );
};

export default SkyraSurvey;
export type { SkyraSurveyProps };
