import { PrefillData } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../../../api/util/http/http';
import BaseComponent from '../../base/BaseComponent';
import addressBuilder from './Address.builder';
import addressForm from './Address.form';

class Address extends BaseComponent {
  isLoading = false;

  static schema() {
    return BaseComponent.schema({
      label: 'Folkeregistrert adresse',
      type: 'navAddress',
      key: 'folkeregistrertAdresse',

      hidden: true,
      hideLabel: true,
      clearOnHide: false,
    });
  }

  init() {
    const appConfig = this.getAppConfig();

    const submissionMethod = appConfig?.submissionMethod;
    const isLoggedIn = appConfig?.config?.isLoggedIn;
    const app = appConfig?.app;
    const logger = appConfig?.logger;

    if (!this.isLoading && app === 'fyllut' && isLoggedIn && submissionMethod === 'digital') {
      this.isLoading = true;
      http
        ?.get<PrefillData>(`${appConfig?.baseUrl}/api/send-inn/prefill-data?properties=sokerAdresser`)
        .then((data) => {
          super.updateValue(data, { modified: true });
        })
        .catch((error) => {
          logger?.info('Failed to fetch prefill data (sokerAdresser)', error);
        })
        .finally(() => {
          this.isLoading = false;
          this.rerender();
        });
    }
  }

  static editForm() {
    return addressForm();
  }

  static get builderInfo() {
    return addressBuilder();
  }

  renderReact(element) {
    element.render(<></>);
  }
}

export default Address;
