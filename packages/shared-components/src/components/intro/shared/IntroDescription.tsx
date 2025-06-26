import InnerHtmlLong from '../../inner-html/InnerHtmlLong';

interface Props {
  description?: string;
}

const IntroDescription = ({ description }: Props) => {
  if (!description) {
    return null;
  }

  return <InnerHtmlLong content={description} spacing />;
};

export default IntroDescription;
