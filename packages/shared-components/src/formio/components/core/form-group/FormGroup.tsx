import { Box } from '@navikt/ds-react';
import BaseComponent from '../../base/BaseComponent';
import FormioReactNestedComponent from '../../base/FormioReactNestedComponent';
import NestedComponents from '../../base/NestedComponents';
import formGroupBuilder from './FormGroup.builder';
import formGroupForm from './FormGroup.form';

class FormGroup extends FormioReactNestedComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Skjemagruppe',
      key: 'navSkjemagruppe',
      type: 'navSkjemagruppe',
      legend: 'Skjemagruppe',
      components: [],
      input: false,
      persistent: false,
    });
  }

  static editForm() {
    return formGroupForm();
  }

  static get builderInfo() {
    return formGroupBuilder();
  }

  // get defaultSchema() {
  //   return FormGroup.schema();
  // }

  renderReact(element) {
    element.render(
      <fieldset>
        {/*{this.getLabel()}*/}
        <Box className="navds-fieldset__content">
          <NestedComponents
            getRef={(ref) => this.setNestedRef(ref)}
            innerHtml={this.renderComponents(this.getComponents())}
          />
        </Box>
      </fieldset>,
    );
  }
}

export default FormGroup;
