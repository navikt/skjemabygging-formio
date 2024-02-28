export interface DrivingListPeriod {
  periodFrom: Date;
  periodTo: Date;
  id: string;
}

export interface DrivingListSubmission {
  selectedDate: string;
  selectedPeriodType?: 'weekly' | 'monthly';
  periods?: DrivingListPeriod[];
  parking?: boolean;
  dates: { date: string; parking: string }[];
  selectedActivity?: string;
}

export type DrivingListValues = Partial<
  Record<keyof DrivingListSubmission, DrivingListSubmission[keyof DrivingListSubmission]>
>;
