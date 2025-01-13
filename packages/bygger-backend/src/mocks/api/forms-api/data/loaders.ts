import { fileLoader } from '../../../utils/file';

const dataDir = `api/forms-api/data`;

export const loadData = fileLoader(dataDir);
