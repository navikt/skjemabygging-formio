import { config } from '../../config/config';
import { fetchFromFormioApi, loadFileFromDirectory } from '../../utils/forms.js';

const { useFormioApi, formioApiServiceUrl, resourcesDir } = config;

const loadMottaksadresser = async () => {
  return useFormioApi
    ? await fetchFromFormioApi(`${formioApiServiceUrl}/mottaksadresse/submission`)
    : await loadFileFromDirectory(resourcesDir, 'mottaksadresser.json', []);
};

const mottaksadresser = {
  get: async (req, res) => res.json(await loadMottaksadresser()),
};

export default mottaksadresser;
export { loadMottaksadresser };
