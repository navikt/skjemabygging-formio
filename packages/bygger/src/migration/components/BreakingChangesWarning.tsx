import AlertStripe from "nav-frontend-alertstriper";
import React from "react";
import { BreakingChanges } from "../../../types/migration";

type BreakingChangesWarningProps = {
  breakingChanges: BreakingChanges[];
};

const BreakingChangesWarning = ({ breakingChanges }: BreakingChangesWarningProps) => (
  <AlertStripe type="feil">
    Migreringen vil gjøre endringer på komponenter som kan brekke avhengigheter i andre komponenter. Normalt vil dette
    skyldes endringer på key, samt verdier i radio eller nedtrekkslister. Vennligst se over følgende avhengigheter:
    <ul>
      {breakingChanges.map(({ componentWithDependencies, dependentComponents }) => {
        const componentLabel = componentWithDependencies.label || componentWithDependencies.label_ORIGINAL;
        const componentKey = componentWithDependencies.key || componentWithDependencies.key_ORIGINAL;
        return (
          <li key={componentWithDependencies.id}>
            <p>
              {componentLabel} ({componentKey}) refereres til av:
            </p>
            <ul>
              {dependentComponents.map(({ key, label }) => (
                <li>
                  {label} ({key})
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  </AlertStripe>
);

export default BreakingChangesWarning;
