import alertBuilder from '../../components/core/alert/Alert.builder';
import formGroupBuilder from '../../components/core/form-group/FormGroup.builder';
import rowBuilder from '../../components/core/row/Row.builder';

const layoutPalett = {
  title: 'Layout',
  components: {
    well: null,
    content: null,
    columns: {
      ignore: true,
    },
    table: {
      ignore: true,
    },
    tabs: {
      ignore: true,
    },
    container: null,
    alertstripe: alertBuilder(),
    fieldset: {
      ignore: true,
    },
    navSkjemagruppe: formGroupBuilder(),
    row: rowBuilder(),
  },
};

export default layoutPalett;
