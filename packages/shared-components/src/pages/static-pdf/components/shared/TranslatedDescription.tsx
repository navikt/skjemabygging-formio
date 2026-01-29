import InnerHtml from '../../../../components/inner-html/InnerHtml';
import { useLanguages } from '../../../../context/languages';

type Props = {
  children?: string;
};

const TranslatedDescription = ({ children }: Props) => {
  const { translate } = useLanguages();

  if (!children) return null;

  return <InnerHtml content={translate(children)} />;
};
export default TranslatedDescription;
