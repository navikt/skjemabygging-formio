import { config } from '../../config/config';
import { fetchFromApi, loadFileFromDirectory } from '../../utils/forms';

const { useFormioMockApi, formioApiServiceUrl, resourcesDir } = config;

const loadMottaksadresser = async () => {
  return useFormioMockApi
    ? await fetchFromApi(`${formioApiServiceUrl}/mottaksadresse/submission`)
    : await loadFileFromDirectory(resourcesDir, 'mottaksadresser.json', []);
};

const mottaksadresser = {
  get: async (req, res) => res.json(await loadMottaksadresser()),
};

export default mottaksadresser;
export { loadMottaksadresser };
