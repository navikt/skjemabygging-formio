import { Knapp } from "nav-frontend-knapper";
import { Input } from "nav-frontend-skjema";
import { Innholdstittel } from "nav-frontend-typografi";
import React, { useState } from "react";

const EditOptionsForm = ({ onSubmit }) => {
  const [editOptions, setEditOptions] = useState([{ key: "", value: "" }]);
  return (
    <>
      <Innholdstittel>Sett opp felter som skal migreres og ny verdi for feltene</Innholdstittel>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {editOptions.map(({ key, value }, index) => (
          <div key={index}>
            <Input
              label="Felt id"
              type="text"
              onChange={(event) =>
                setEditOptions([
                  ...editOptions.filter((editOptionsRow) => editOptionsRow.key !== key),
                  {
                    key: event.target.value,
                    value,
                  },
                ])
              }
            />
            <Input
              label="Ny verdi"
              type="text"
              disabled={!key}
              onChange={(event) =>
                setEditOptions([
                  ...editOptions.filter((editOptionsRow) => editOptionsRow.key !== key),
                  {
                    key,
                    value: event.target.value,
                  },
                ])
              }
            />
          </div>
        ))}
        <Knapp
          onClick={() =>
            setEditOptions([
              ...editOptions,
              {
                key: "",
                value: "",
              },
            ])
          }
          htmlType="button"
        >
          Legg til felt
        </Knapp>
      </form>
    </>
  );
};

export default EditOptionsForm;
