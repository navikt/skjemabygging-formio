/**
 * Regex matches that there is an html-tag in the string,
 * excluding the <br>-tag (with possible whitespace and self-closing "/").
 */
const isHtmlString = (text: string) => /<(?!br\s*\/?)[^>]+>/gm.test(text);

const extractTextContent = (htmlString: string) => {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  return div.textContent ?? div.innerText;
};

const htmlUtils = { isHtmlString, extractTextContent };
export default htmlUtils;
