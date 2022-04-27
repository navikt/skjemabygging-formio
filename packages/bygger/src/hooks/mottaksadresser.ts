import { MottaksadresseData, MottaksadresseEntity } from "@navikt/skjemadigitalisering-shared-domain";

export class Mottaksadresse implements MottaksadresseData {
  id: string;
  adresselinje1: string;
  adresselinje2?: string;
  adresselinje3?: string;
  postnummer: string;
  poststed: string;

  constructor(id, data: MottaksadresseData) {
    this.id = id;
    this.adresselinje1 = data.adresselinje1;
    this.adresselinje2 = data.adresselinje2;
    this.adresselinje3 = data.adresselinje3;
    this.postnummer = data.postnummer;
    this.poststed = data.poststed;
  }

  public toString = (): string => {
    const linjer = [this.adresselinje1];
    if (this.adresselinje2) {
      linjer.push(this.adresselinje2);
    }
    if (this.adresselinje3) {
      linjer.push(this.adresselinje3);
    }
    return `${linjer.join(", ")}, ${this.postnummer} ${this.poststed}`;
  };
}

export const fromEntity = (entity: MottaksadresseEntity) => new Mottaksadresse(entity._id, entity.data);
