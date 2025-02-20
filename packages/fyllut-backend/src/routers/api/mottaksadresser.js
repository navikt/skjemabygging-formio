import { config } from '../../config/config';
import { fetchFromApi, loadFileFromDirectory } from '../../utils/forms';

const { useFormioApi, formioApiServiceUrl, resourcesDir } = config;

const loadMottaksadresser = async () => {
  return useFormioApi
    ? await fetchFromApi(`${formioApiServiceUrl}/mottaksadresse/submission`)
    : await loadFileFromDirectory(resourcesDir, 'mottaksadresser.json', []);
};

const mottaksadresser = {
  get: async (req, res) => res.json(await loadMottaksadresser()),
};

export default mottaksadresser;
export { loadMottaksadresser };
