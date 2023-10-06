import coAdresseSchema from './coAdresseSchema';
import utlandByStedSchema from './utlandByStedSchema';
import utlandBygningSchema from './utlandBygningSchema';
import utlandLandSchema from './utlandLandSchema';
import utlandPostkodeSchema from './utlandPostkodeSchema';
import utlandRegionSchema from './utlandRegionSchema';
import utlandVegadressePostboksSchema from './utlandVegadressePostboksSchema';

const utenlandskAdresseSchema = (keyPostfix = '') => ({
  key: `utenlandskAdresse`,
  type: 'container',
  label: 'Utenlandsk kontaktadresse',
  hideLabel: true,
  input: false,
  tableView: false,
  components: [
    coAdresseSchema(keyPostfix),
    utlandVegadressePostboksSchema(keyPostfix),
    utlandBygningSchema(keyPostfix),
    utlandPostkodeSchema(keyPostfix),
    utlandByStedSchema(keyPostfix),
    utlandRegionSchema(keyPostfix),
    utlandLandSchema(keyPostfix),
  ],
});

export default utenlandskAdresseSchema;
