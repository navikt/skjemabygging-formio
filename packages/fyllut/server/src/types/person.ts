export interface Person {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  children?: Person[];
}
