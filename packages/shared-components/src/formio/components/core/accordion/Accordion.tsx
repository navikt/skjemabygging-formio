import { Accordion as NavAccordion } from '@navikt/ds-react';
import BaseComponent from '../../base/BaseComponent';
import accordionBuilder from './Accordion.builder';
import accordionForm from './Accordion.form';

class Accordion extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Trekkspill',
      type: 'accordion',
      key: 'accordion',
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
      <NavAccordion id={this.getId()} ref={(ref) => this.setReactInstance(ref)} headingSize={this.getTitleSize()}>
        {this.getAccordionValues()?.map((item, index) => (
          <NavAccordion.Item key={index} defaultOpen={item.defaultOpen}>
            <NavAccordion.Header>{item.title}</NavAccordion.Header>
            <NavAccordion.Content>
              <div dangerouslySetInnerHTML={{ __html: item.content }}></div>
            </NavAccordion.Content>
          </NavAccordion.Item>
        ))}
      </NavAccordion>,
    );
  }
}

export default Accordion;
