import { createUseStyles } from 'react-jss';

const makeStyles = <C extends string, Props = unknown, Theme = Jss.Theme>(style) => {
  return createUseStyles<C, Props, Theme>(style);
};

export default makeStyles;
