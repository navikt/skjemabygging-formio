import { createUseStyles } from "react-jss";

const makeStyles = (style) => {
  return createUseStyles(style);
};

/*
declare function createUseStyles<C extends string = string, Props = unknown, Theme = DefaultTheme>(
  styles: Styles<C, Props, Theme> | ((theme: Theme) => Styles<C, Props, undefined>),
  options?: CreateUseStylesOptions<Theme>
): (data?: Props & {theme?: Theme}) => Classes<C>
 */

export default makeStyles;
