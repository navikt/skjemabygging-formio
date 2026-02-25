interface DrivingListPeriod {
  periodFrom: string;
  periodTo: string;
  id: string;
}

interface DrivingListSubmission {
  // Paper
  selectedDate: string;
  periods?: DrivingListPeriod[];
  parking?: boolean;

  // Digital
  selectedVedtaksId?: string;
  tema?: string;

  // Paper and Digital
  dates: { date: string; parking: string; betalingsplanId?: string }[];
}

type DrivingListValues = Partial<
  Record<keyof DrivingListSubmission, DrivingListSubmission[keyof DrivingListSubmission]>
>;

export type { DrivingListPeriod, DrivingListSubmission, DrivingListValues };
