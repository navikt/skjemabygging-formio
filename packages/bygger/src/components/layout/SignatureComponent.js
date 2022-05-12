import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { Knapp } from "nav-frontend-knapper";
import Lukknapp from "nav-frontend-lukknapp";
import { Input, SkjemaGruppe } from "nav-frontend-skjema";
import { Undertittel } from "nav-frontend-typografi";
import React from "react";

const useStyles = makeStyles({
  closeBtn: {
    marginLeft: "auto",
    marginRight: 0,
  },
});

const SignatureComponent = ({ signature, onChange }) => {
  //const [signatureData, setSignatureData] = useState({label: "", description: ""});

  // const handleSignatureOnChange = (signatureInput) => {
  //   setSignatureData({label: signatureInput, description: signatureData.description})
  //   console.log(signatureData)
  // }

  // const handleInstructionOnChange = (instructionInput) => {
  //   setSignatureData({label: signatureData.label, description: instructionInput})
  //   console.log(signatureData)
  // }

  const styles = useStyles();
  return (
    <div className="wrapper">
      <Lukknapp className={styles.closeBtn} bla={true}>
        Lukk
      </Lukknapp>
      <SkjemaGruppe legend={<Undertittel>Signering</Undertittel>}>
        <Input
          label="Hvem skal signere?"
          type="text"
          id="signatur"
          placeholder="Signatur"
          value={signature.label}
          onChange={(e) =>
            onChange({
              label: e.target.value,
              description: signature.description,
            })
          }
        />
        <Input
          label="Instruksjoner til den som signerer"
          type="text"
          id="Instruksjon"
          placeholder="Instruksjon"
          value={signature.description}
          onChange={(e) =>
            onChange({
              label: signature.label,
              description: e.target.value,
            })
          }
        />
        <Knapp onClick={() => console.log()}>Legg til signatur</Knapp>
      </SkjemaGruppe>
    </div>
  );
};

export default SignatureComponent;
