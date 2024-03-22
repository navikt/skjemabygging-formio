export interface DrivingListPeriod {
  periodFrom: Date;
  periodTo: Date;
  id: string;
}

export interface DrivingListSubmission {
  // Paper
  selectedDate: string;
  periods?: DrivingListPeriod[];
  parking?: boolean;

  // Digital
  selectedVedtaksId?: string;

  // Paper and Digital
  dates: { date: string; parking: string; betalingsplanId?: string }[];
}

export type DrivingListValues = Partial<
  Record<keyof DrivingListSubmission, DrivingListSubmission[keyof DrivingListSubmission]>
>;
