import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import InternalTextField from '../text-field/InternalTextField';
import { toParkingExpenseRules } from './drivingListValidation';

interface DrivingListParkingExpenseProps {
  statePath: string;
  /** The day the expense belongs to; the rule names it when the amount is not a whole number. */
  date: string;
  enforceMaxHundred: boolean;
}

/** Parking expense for a single day in the driving list. */
const DrivingListParkingExpense = ({ statePath, date, enforceMaxHundred }: DrivingListParkingExpenseProps) => (
  <InternalTextField
    statePath={statePath}
    label={TEXTS.statiske.drivingList.parkingExpenses}
    type="text"
    inputMode="numeric"
    required={false}
    validation={toParkingExpenseRules(date, enforceMaxHundred)}
  />
);

export default DrivingListParkingExpense;
export type { DrivingListParkingExpenseProps };
