import React from "react";
import { NavBar } from "../components/NavBar";
import { Pagewrapper } from "../Forms/components";
import { styled } from "@material-ui/styles";
import NavForm from "../components/NavForm";

const StyledNavForm = styled(NavForm)({
  margin: "0 auto",
  maxWidth: "26.25rem",
});

const NewResource = ({ projectURL }) => (
  <div>
    <NavBar title={"Skjemabygger"} />
    <Pagewrapper>
      <StyledNavForm src={`${projectURL}/language`} onSubmitDone={() => alert("Saved!")} />
    </Pagewrapper>
  </div>
);

export default NewResource;
