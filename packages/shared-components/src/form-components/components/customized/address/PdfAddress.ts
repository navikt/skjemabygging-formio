import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';
import { addressToString } from './addressUtils';

const PdfAddress = (props: PdfComponentProps) => {
  return DefaultAnswer(props, addressToString);
};

export default PdfAddress;
