import { fileLoader } from '../../../utils/file';

const dataDir = `${import.meta.dirname}`;

export const loadData = fileLoader(dataDir);
