import { Box } from '@navikt/ds-react';
import BaseComponent from '../../base/BaseComponent';
import BaseNestedComponent from '../../base/BaseNestedComponent';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
import NestedComponents from '../../base/NestedComponents';
import NestedFormioComponents from '../../base/NestedFormioComponents';
import formGroupBuilder from './FormGroup.builder';
import formGroupForm from './FormGroup.form';

class FormGroup extends BaseNestedComponent {
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

  renderReact(element) {
    element.render(
      <fieldset>
        <Label
          component={this.component}
          options={this.options}
          builderMode={this.builderMode}
          editFields={this.getEditFields()}
          translate={this.translate.bind(this)}
          labelOptions={{ useLegend: true, showOptional: false }}
        />
        <Description component={this.component} translate={this.translate.bind(this)} />
        <Box className="navds-fieldset__content">
          {this.builderMode ? (
            <NestedFormioComponents
              getRef={(ref) => this.setNestedRef(ref)}
              innerHtml={this.renderComponents(this.getComponents())}
            />
          ) : (
            <NestedComponents
              components={this.getComponents()}
              handleChange={this.updateSubmission.bind(this)}
              translate={this.translate.bind(this)}
            />
          )}
        </Box>
      </fieldset>,
    );
  }
}

export default FormGroup;
