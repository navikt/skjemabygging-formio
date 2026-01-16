import { Accordion as NavAccordion } from '@navikt/ds-react';
import InnerHtml from '../../../../components/inner-html/InnerHtml';
import BaseComponent from '../../base/BaseComponent';
import accordionBuilder from './Accordion.builder';
import accordionForm from './Accordion.form';

class Accordion extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Trekkspill',
      type: 'accordion',
      key: 'accordion',
      hideLabel: true,
    });
  }

  static editForm() {
    return accordionForm();
  }

  static get builderInfo() {
    return accordionBuilder();
  }

  getAccordionValues() {
    return this.component?.accordionValues;
  }

  getTitleSize() {
    return this.component?.titleSize as 'large' | 'medium' | 'small' | 'xsmall';
  }

  renderReact(element) {
    element.render(
      <NavAccordion id={this.getId()} ref={(ref) => this.setReactInstance(ref)}>
        {this.getAccordionValues()?.map((item, index) => (
          <NavAccordion.Item key={index} defaultOpen={item.defaultOpen}>
            <NavAccordion.Header>{this.translate(item.title)}</NavAccordion.Header>
            <NavAccordion.Content>
              <InnerHtml content={this.translate(item.content)} />
            </NavAccordion.Content>
          </NavAccordion.Item>
        ))}
      </NavAccordion>,
    );
  }
}

export default Accordion;
