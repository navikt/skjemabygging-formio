import { styled } from "@material-ui/styles";
import { NavForm } from "@navikt/skjemadigitalisering-shared-components";
import { Pagewrapper } from "../Forms/components";
import { AppLayout } from "../components/AppLayout";

const StyledNavForm = styled(NavForm)({
  margin: "0 auto",
  maxWidth: "26.25rem",
});

const NewTranslation = ({ projectURL }) => (
  <AppLayout
    navBarProps={{
      title: "Oversettelser",
      visOversettelseliste: true,
      visLagNyttSkjema: false,
    }}
  >
    <Pagewrapper>
      <StyledNavForm src={`${projectURL}/language`} />
    </Pagewrapper>
  </AppLayout>
);

export default NewTranslation;
