export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  deathDate?: string;
  address?: Address;
  children?: Person[];
}

export interface Address {
  streetAddress: string;
  postcode?: string;
  city?: string;
  countryCode: string;
}
