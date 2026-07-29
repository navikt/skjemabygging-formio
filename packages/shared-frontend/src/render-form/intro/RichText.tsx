import { sanitizeHtml } from '../../utils/sanitizeHtml';

const RichText = ({ content }: { content?: string }) =>
  content ? <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} /> : null;

export default RichText;
