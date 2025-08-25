interface Props {
  children?: React.ReactNode;
}

const FormMainContent = ({ children }: Props) => {
  return (
    <section id="maincontent" tabIndex={-1} aria-describedby="page-title">
      {children}
    </section>
  );
};

export default FormMainContent;
