import { InnerHtmlLong } from './SanitizedHtml';

interface Props {
  description?: string;
}

const IntroDescription = ({ description }: Props) =>
  description ? <InnerHtmlLong content={description} spacing /> : null;

export default IntroDescription;
