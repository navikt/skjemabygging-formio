export interface Person {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  deathDate?: string;
  address?: Address;
  children?: Person[];
}

export interface Address {
  street: string;
  postalCode?: string;
  city?: string;
  countryCode: string;
}
