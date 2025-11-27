interface Props {
  children?: React.ReactNode;
}

const FormMainContent = ({ children }: Props) => {
  return <section>{children}</section>;
};

export default FormMainContent;
