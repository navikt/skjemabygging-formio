import { Address } from '@navikt/skjemadigitalisering-shared-domain';

const addressToString = (address: Address): string => {
  const addressComponents = [
    address?.co ? `c/o ${address.co}` : undefined,
    address?.adresse,
    address?.bygning,
    address?.postboks,
    address?.postnummer
      ? address.bySted
        ? `${address?.postnummer} ${address?.bySted}`
        : address.postnummer
      : address?.bySted,
    address?.region,
    address?.land?.label,
  ].filter(Boolean);

  return addressComponents.join(', ');
};

export { addressToString };
