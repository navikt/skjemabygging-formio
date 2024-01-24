import { Tag } from '@navikt/ds-react';
import React from 'react';
import BaseComponent from '../../base/BaseComponent';
import htmlElementBuilder from './HtmlElement.builder';
import htmlElementForm from './HtmlElement.form';

class HtmlElement extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      type: 'htmlelement',
      key: 'htmlelement',
      tag: 'div',
      attrs: [],
      content: '',
      input: false,
      hideLabel: true,
      persistent: false,
    });
  }

  static editForm() {
    return htmlElementForm();
  }

  static get builderInfo() {
    return htmlElementBuilder();
  }

  getTag() {
    return this.component?.tag as string;
  }

  getPdfTag() {
    if (this.component?.textDisplay === 'pdf') {
      return (
        <Tag variant="alt3" className="mb-4" size="xsmall">
          PDF
        </Tag>
      );
    } else if (this.component?.textDisplay === 'formPdf') {
      return (
        <Tag variant="alt3" className="mb-4" size="xsmall">
          Skjema og PDF
        </Tag>
      );
    }
  }

  renderReact(element) {
    element.render(
      <div>
        {this.getPdfTag()}
        {React.createElement(this.getTag(), {
          dangerouslySetInnerHTML: {
            __html: this.getContent(),
          },
        })}
      </div>,
    );
  }
}

export default HtmlElement;
