import React from "react";
import { useHistory } from "react-router-dom";
import { SletteKnapp } from "../Forms/components";
import { AppLayoutWithContext } from "../components/AppLayout";
import { flattenComponents } from "../util/forsteside";
import { Input } from "nav-frontend-skjema";
import { Sidetittel } from "nav-frontend-typografi";

const getAllTextsForForm = (form) =>
  flattenComponents(form.components)
    .map(({ content, title, label, html, type, values }) => ({
      title,
      label: ["panel", "htmlelement", "content"].indexOf(type) === -1 ? label : undefined,
      html,
      values: values ? values.map((value) => value.label) : undefined,
      content,
    }))
    .reduce((allTextsForForm, component) => {
      return [
        ...allTextsForForm,
        ...Object.keys(component)
          .filter((key) => component[key] !== undefined)
          .reduce((textsForComponent, key) => {
            console.log("Key", component[key]);
            if (key === "values") {
              return [...textsForComponent, ...component[key].map((value) => ({ text: value, type: "text" }))];
            } else if (key === "html" || key === "content") {
              return [...textsForComponent, { text: component[key], type: "textarea" }];
            } else {
              return [...textsForComponent, { text: component[key], type: "text" }];
            }
          }, []),
      ];
    }, []);

const TranslationsByFormPage = ({ deleteLanguage, form, resourceId }) => {
  const history = useHistory();
  const {
    title,
    //path,
    properties: { skjemanummer },
  } = form;
  const flattenedComponents = getAllTextsForForm(form);
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Rediger oversettelse",
        visSkjemaliste: false,
        visLagNyttSkjema: false,
        visOversettelseliste: true,
      }}
      rightCol={
        <SletteKnapp
          className="lenke"
          onClick={() => deleteLanguage(resourceId).then(() => history.push("/translations"))}
        >
          Slett oversettelser
        </SletteKnapp>
      }
    >
      <Sidetittel className="margin-bottom-large">
        {skjemanummer} {title}
      </Sidetittel>
      <form>
        {flattenedComponents.map(({ text, type }) => (
          <Input className="margin-bottom-default" label={text} type={type} />
        ))}
      </form>
    </AppLayoutWithContext>
  );
};

export default TranslationsByFormPage;
