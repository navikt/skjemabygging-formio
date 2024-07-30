import { ForstesideRequestBody, Mottaksadresse, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import {
  genererAdresse,
  genererDokumentlisteFoersteside,
  genererFoerstesideData,
  genererMottaksadresse,
  genererPersonalia,
  genererSkjemaTittel,
  genererVedleggsListe,
  getVedleggsFelterSomSkalSendes,
} from './forsteside';

const genererVedleggComponent = (key, label, vedleggskode, vedleggstittel) => ({
  label,
  values: [
    { label: 'Jeg legger det ved denne søknaden (anbefalt)', value: 'leggerVedNaa', shortcut: '' },
    {
      label:
        'Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)',
      value: 'ettersender',
      shortcut: '',
    },
    { label: 'Jeg har levert denne dokumentasjonen tidligere', value: 'levertTidligere', shortcut: '' },
  ],
  key,
  properties: {
    vedleggstittel,
    vedleggskode,
  },
  type: 'radio',
});

const formMedVedlegg = {
  components: [
    {
      title: 'Vedlegg',
      key: 'page5',
      properties: {},
      type: 'panel',
      label: 'Page 5',
      components: [
        genererVedleggComponent(
          'vedleggO9',
          'Skriftlig bekreftelse på studieplass',
          'O9',
          'Bekreftelse fra studiested/skole',
        ),
        genererVedleggComponent(
          'vedleggQ7',
          'Faktura fra utdanningsinstitusjon',
          'Q7',
          'Dokumentasjon av utgifter i forbindelse med utdanning',
        ),
      ],
    },
  ],
} as unknown as NavFormType;

describe('forsteside', () => {
  describe('genererPersonalia', () => {
    it('returns bruker if we have fodselsNummer', () => {
      const actual = genererPersonalia('12345678911');
      expect(actual).toEqual({
        bruker: {
          brukerId: '12345678911',
          brukerType: 'PERSON',
        },
      });
    });

    it('returns ukjentBruker if we do not have fodselsNummer', () => {
      const actual = genererPersonalia(undefined, {
        navn: 'Test Testesen',
        adresse: 'Testveien 1',
        postnr: '1234',
        sted: 'Oslo',
        land: 'Norge',
      });
      expect(actual).toEqual({
        ukjentBrukerPersoninfo: 'Test Testesen, Testveien 1, 1234 Oslo, Norge.',
      });
    });

    it('throws error is both fodselsNummer and address is missing', () => {
      expect(() => genererPersonalia(undefined, undefined)).toThrowError(
        'User needs to submit either fodselsNummer or address',
      );
    });
  });

  describe('genererSkjemaTittel', () => {
    it('generates correct skjemaTittel', () => {
      const actual = genererSkjemaTittel('Registreringsskjema for tilskudd til utdanning', 'NAV 76-07.10');
      expect(actual).toBe('NAV 76-07.10 Registreringsskjema for tilskudd til utdanning');
    });
  });

  describe('getVedleggsFelterSomSkalSendes', () => {
    it('adds all vedlegg which are set as leggerVedNaa', () => {
      const actual = getVedleggsFelterSomSkalSendes(
        {
          vedleggQ7: 'leggerVedNaa',
          vedleggO9: 'leggerVedNaa',
        },
        formMedVedlegg,
      );
      expect(actual.map((component) => component.key)).toEqual(['vedleggO9', 'vedleggQ7']);
    });

    it('does not add vedlegg which should not be submitted now', () => {
      const actual = getVedleggsFelterSomSkalSendes(
        {
          vedleggQ7: 'levertTidligere',
          vedleggO9: 'ettersender',
        },
        formMedVedlegg,
      );
      expect(actual.map((component) => component.key)).toEqual([]);
    });

    it('handles several vedlegg with the same vedleggskode', () => {
      const actual = getVedleggsFelterSomSkalSendes(
        {
          vedlegg1: 'leggerVedNaa',
          vedlegg2: 'leggerVedNaa',
          vedlegg3: 'leggerVedNaa',
        },
        {
          components: [
            genererVedleggComponent('vedlegg1', 'Label 1', 'O9', 'Vedleggstittel 1'),
            genererVedleggComponent('vedlegg2', 'Label 2', 'O9', 'Vedleggstittel 2'),
            genererVedleggComponent('vedlegg3', 'Label 3', 'Q7', 'Vedleggstittel 3'),
          ],
        } as unknown as NavFormType,
      );
      expect(actual.map((component) => component.key)).toEqual(['vedlegg1', 'vedlegg2', 'vedlegg3']);
    });

    describe('handles new attachment type', () => {
      it('onlye leggerVedNaa should be included', () => {
        const actual = getVedleggsFelterSomSkalSendes(
          {
            vedlegg1: {
              key: 'ettersender',
            },
            vedlegg2: {
              key: 'nei',
            },
            vedlegg3: {
              key: 'leggerVedNaa',
            },
            vedlegg4: {
              key: 'levertTidligere',
            },
            vedlegg5: {
              key: 'harIkke',
            },
            vedlegg6: {
              key: 'andre',
            },
            vedlegg7: {
              key: 'nav',
            },
          },
          {
            components: [
              genererVedleggComponent('vedlegg1', 'Label 1', 'O9', 'Vedleggstittel 1'),
              genererVedleggComponent('vedlegg2', 'Label 2', 'O9', 'Vedleggstittel 2'),
              genererVedleggComponent('vedlegg3', 'Label 3', 'Q7', 'Vedleggstittel 3'),
              genererVedleggComponent('vedlegg4', 'Label 4', 'Q7', 'Vedleggstittel 4'),
              genererVedleggComponent('vedlegg5', 'Label 5', 'Q7', 'Vedleggstittel 5'),
              genererVedleggComponent('vedlegg6', 'Label 6', 'Q7', 'Vedleggstittel 6'),
              genererVedleggComponent('vedlegg7', 'Label 7', 'Q7', 'Vedleggstittel 7'),
            ],
          } as unknown as NavFormType,
        );
        expect(actual.map((component) => component.key)).toEqual(['vedlegg3']);
      });
    });
  });

  describe('genererVedleggsListe', () => {
    it('generates correct vedleggsListe', () => {
      const actual = genererVedleggsListe(formMedVedlegg, { vedleggQ7: 'leggerVedNaa', vedleggO9: 'leggerVedNaa' });
      expect(actual).toEqual([
        'Bekreftelse fra studiested/skole',
        'Dokumentasjon av utgifter i forbindelse med utdanning',
      ]);
    });

    it('handles correctly when no vedlegg will be submitted', () => {
      const actual = genererVedleggsListe(formMedVedlegg, { vedleggQ7: 'ettersender' });
      expect(actual).toEqual([]);
    });
  });

  describe('genererDokumentListeFoersteside', () => {
    it('generates correct dokumentListeFoersteside', () => {
      const actual = genererDokumentlisteFoersteside(
        'Registreringsskjema for tilskudd til utdanning',
        'NAV 76-07.10',
        formMedVedlegg,
        {
          vedleggQ7: 'leggerVedNaa',
          vedleggO9: 'leggerVedNaa',
        },
      );
      expect(actual).toEqual([
        'NAV 76-07.10 Registreringsskjema for tilskudd til utdanning',
        'Skriftlig bekreftelse på studieplass',
        'Faktura fra utdanningsinstitusjon',
      ]);
    });
  });

  describe('genererAdresse', () => {
    it('generates correct Norwegian address', () => {
      const actual = genererAdresse({
        gateadresseSoker: 'Testveien 1',
        postnrSoker: '1234',
        poststedSoker: 'Oslo',
        fornavnSoker: 'Test',
        etternavnSoker: 'Testesen',
      });
      expect(actual).toEqual({
        navn: `Test Testesen`,
        adresse: 'Testveien 1',
        postnr: '1234',
        sted: 'Oslo',
      });
    });

    it('generates correct foreign address', () => {
      const actual = genererAdresse({
        gateadresseSoker: 'Testveien 1',
        landSoker: 'USA',
        utenlandskPostkodeSoker: '1234',
        poststedSoker: 'NY',
        fornavnSoker: 'Test',
        etternavnSoker: 'Testesen',
      });
      expect(actual).toEqual({
        navn: `Test Testesen`,
        adresse: 'Testveien 1',
        postnr: '1234',
        sted: 'NY',
        land: 'USA',
      });
    });

    it('generates correct foreign address without utenlandskPostkodeSoker', () => {
      const actual = genererAdresse({
        gateadresseSoker: 'Testveien 1',
        landSoker: 'USA',
        poststedSoker: 'NY',
        fornavnSoker: 'Test',
        etternavnSoker: 'Testesen',
      });
      expect(actual).toEqual({
        navn: `Test Testesen`,
        adresse: 'Testveien 1',
        sted: 'NY',
        land: 'USA',
      });
    });
  });

  describe('genererMottaksAdresse', () => {
    it('returns default netsPostboks if neither mottaksadresseId or enhet is provided', () => {
      expect(genererMottaksadresse(undefined, [])).toStrictEqual({ netsPostboks: '1400' });
    });

    it('finds and returns the correct mottaksadresse when mottaksadresseId and mottaksadresser is provided', () => {
      expect(
        genererMottaksadresse('002', [
          { _id: '001', data: { adresselinje1: 'Gate 1', postnummer: '0001', poststed: 'By' } },
          {
            _id: '002',
            data: {
              adresselinje1: 'Gate 2',
              adresselinje2: 'postboks 2',
              adresselinje3: 'c/o',
              postnummer: '0002',
              poststed: 'By',
            },
          },
          { _id: '003', data: { adresselinje1: 'Gate 3', postnummer: '0003', poststed: 'By' } },
        ] as Mottaksadresse[]),
      ).toStrictEqual({
        adresse: {
          adresselinje1: 'Gate 2',
          adresselinje2: 'postboks 2',
          adresselinje3: 'c/o',
          postnummer: '0002',
          poststed: 'By',
        },
      });
    });

    it("returns default netsPostboks if mottaksadresseId doesn't match any of the provided mottaksadresse", () => {
      expect(
        genererMottaksadresse('123', [
          { _id: '001', data: { adresselinje1: 'Gate 1', postnummer: '0001', poststed: 'By' } },
        ] as Mottaksadresse[]),
      ).toStrictEqual({ netsPostboks: '1400' });
    });

    it('returns enhetsnummer and default netsPostboks if mottaksadresseId is undefined and enhetsnummer is provided', () => {
      expect(genererMottaksadresse(undefined, [], '123')).toStrictEqual({ enhetsnummer: '123', netsPostboks: '1400' });
    });
  });

  describe('genererFoerstesideData', () => {
    const defaultForm = {
      title: 'Testskjema',
      properties: {
        skjemanummer: 'WIP 12.34-56',
        tema: 'BIL',
      },
      components: [],
    };

    it('correctly generates foersteside data', () => {
      const actual = genererFoerstesideData(
        {
          ...formMedVedlegg,
          properties: { skjemanummer: 'NAV 76-07.10', tema: 'OPP' },
          title: 'Registreringsskjema for tilskudd til utdanning',
        } as NavFormType,
        {
          gateadresseSoker: 'Testveien 1',
          landSoker: 'USA',
          utenlandskPostkodeSoker: '1234',
          poststedSoker: 'NY',
          fornavnSoker: 'Test',
          etternavnSoker: 'Testesen',
          fodselsnummerDNummerSoker: '12345678911',
          vedleggQ7: 'leggerVedNaa',
          vedleggO9: 'leggerVedNaa',
        },
      );
      expect(actual).toEqual({
        foerstesidetype: 'SKJEMA',
        navSkjemaId: 'NAV 76-07.10',
        spraakkode: 'NB',
        overskriftstittel: 'NAV 76-07.10 Registreringsskjema for tilskudd til utdanning',
        arkivtittel: 'NAV 76-07.10 Registreringsskjema for tilskudd til utdanning',
        tema: 'OPP',
        vedleggsliste: ['Bekreftelse fra studiested/skole', 'Dokumentasjon av utgifter i forbindelse med utdanning'],
        dokumentlisteFoersteside: [
          'NAV 76-07.10 Registreringsskjema for tilskudd til utdanning',
          'Skriftlig bekreftelse på studieplass',
          'Faktura fra utdanningsinstitusjon',
        ],
        bruker: {
          brukerId: '12345678911',
          brukerType: 'PERSON',
        },
        netsPostboks: '1400',
      });
    });

    describe('Språkkode', () => {
      const defaultForm = { properties: { skjemanummer: 'TST 10.11-12' }, components: [] };
      const defaultSubmission = {};

      it('Bokmål brukes dersom språk ikke er valgt', () => {
        const forstesideRequest = genererFoerstesideData(defaultForm, defaultSubmission, undefined);
        expect(forstesideRequest.spraakkode).toBe('NB');
      });

      it("Bokmål brukes dersom 'nb-NO' er valgt", () => {
        const forstesideRequest = genererFoerstesideData(defaultForm, defaultSubmission, 'nb-NO');
        expect(forstesideRequest.spraakkode).toBe('NB');
      });

      it("Nynorsk brukes dersom 'nn-NO' er valgt", () => {
        const forstesideRequest = genererFoerstesideData(defaultForm, defaultSubmission, 'nn-NO');
        expect(forstesideRequest.spraakkode).toBe('NN');
      });

      it("Engelsk brukes dersom 'en' er valgt", () => {
        const forstesideRequest = genererFoerstesideData(defaultForm, defaultSubmission, 'en');
        expect(forstesideRequest.spraakkode).toBe('EN');
      });

      it('Engelsk brukes dersom et annet språk er valgt', () => {
        const forstesideRequest = genererFoerstesideData(defaultForm, defaultSubmission, 'pl');
        expect(forstesideRequest.spraakkode).toBe('EN');
      });
    });

    describe('Bruker uten fødselsnummer', () => {
      describe('med norsk vegadresse', () => {
        const navnPostnrPoststed = {
          fornavnSoker: 'Solan',
          etternavnSoker: 'Gundersen',
          norskVegadresse: {
            postnrSoker: '3520',
            poststedSoker: 'Jevnaker',
          },
        };

        it('henter gate og husnummer fra gateadresseSoker', () => {
          const submission = {
            ...navnPostnrPoststed,
            gateadresseSoker: 'Flåklypatoppen 1',
          };
          const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
          expect(forsteside.ukjentBrukerPersoninfo).toBe('Solan Gundersen, Flåklypatoppen 1, 3520 Jevnaker, Norge.');
        });

        it('genererer ikke ukjentBrukerPersoninfo når søkers personinformasjon mangler i submission', () => {
          const submission = {
            fornavnArbeidstaker: 'Test',
            etternavnArbeidstaker: 'Testesen',
            fodselsnummerDNummerArbeidstaker: '12345678911',
          };
          const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
          expect(forsteside.ukjentBrukerPersoninfo).toBe('');
        });

        it('henter gate og husnummer fra vegadresseSoker', () => {
          const submission = {
            ...navnPostnrPoststed,
            norskVegadresse: {
              ...navnPostnrPoststed.norskVegadresse,
              vegadresseSoker: 'Flåklypatoppen 1',
            },
          };
          const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
          expect(forsteside.ukjentBrukerPersoninfo).toBe('Solan Gundersen, Flåklypatoppen 1, 3520 Jevnaker, Norge.');
        });

        it('legger til c/o-adressering', () => {
          const submission = {
            ...navnPostnrPoststed,
            norskVegadresse: {
              ...navnPostnrPoststed.norskVegadresse,
              coSoker: 'Reodor Felgen',
              vegadresseSoker: 'Flåklypatoppen 1',
            },
          };
          const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
          expect(forsteside.ukjentBrukerPersoninfo).toBe(
            'Solan Gundersen, c/o Reodor Felgen, Flåklypatoppen 1, 3520 Jevnaker, Norge.',
          );
        });
      });

      describe('med norsk postboksadresse', () => {
        it('Tar med navn på eier av postboksen', () => {
          const submission = {
            fornavnSoker: 'Solan',
            etternavnSoker: 'Gundersen',
            norskPostboksadresse: {
              coSoker: 'Reodor Felgen',
              postboksNrSoker: '55 Toppen',
              postnrSoker: '3520',
              poststedSoker: 'Jevnaker',
            },
          };
          const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
          expect(forsteside.ukjentBrukerPersoninfo).toBe(
            'Solan Gundersen, c/o Reodor Felgen, Postboks 55 Toppen, 3520 Jevnaker, Norge.',
          );
        });

        it('Tar hensyn til at det er valgfritt å oppgi eier på postboks', () => {
          const submission = {
            fornavnSoker: 'Solan',
            etternavnSoker: 'Gundersen',
            norskPostboksadresse: {
              oSoker: undefined,
              postboksNrSoker: '55 Toppen',
              postnrSoker: '3520',
              poststedSoker: 'Jevnaker',
            },
          };
          const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
          expect(forsteside.ukjentBrukerPersoninfo).toBe('Solan Gundersen, Postboks 55 Toppen, 3520 Jevnaker, Norge.');
        });
      });

      describe('med utenlandsk adresse', () => {
        it('Formatteres korrekt', () => {
          const submission = {
            fornavnSoker: 'Solan',
            etternavnSoker: 'Gundersen',
            utenlandskAdresse: {
              coSoker: undefined,
              postboksNrSoker: '12603 Denmark Drive',
              bygningSoker: 'Apt.556',
              postkodeSoker: 'VA 22071-9945',
              poststedSoker: 'Herndon',
              regionSoker: undefined,
              landSoker: 'USA',
            },
          };
          const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
          expect(forsteside.ukjentBrukerPersoninfo).toBe(
            'Solan Gundersen, 12603 Denmark Drive, Apt.556, VA 22071-9945 Herndon, USA.',
          );
        });

        it('Formatteres korrekt med c/o-adressering', () => {
          const submission = {
            fornavnSoker: 'Solan',
            etternavnSoker: 'Gundersen',
            utenlandskAdresse: {
              coSoker: 'Bart Simpson',
              postboksNrSoker: '12603 Denmark Drive',
              bygningSoker: 'Apt.556',
              postkodeSoker: 'VA 22071-9945',
              poststedSoker: 'Herndon',
              regionSoker: undefined,
              landSoker: 'USA',
            },
          };
          const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
          expect(forsteside.ukjentBrukerPersoninfo).toBe(
            'Solan Gundersen, c/o Bart Simpson, 12603 Denmark Drive, Apt.556, VA 22071-9945 Herndon, USA.',
          );
        });

        it('Formatteres korrekt med region', () => {
          const submission = {
            fornavnSoker: 'Solan',
            etternavnSoker: 'Gundersen',
            utenlandskAdresse: {
              coSoker: undefined,
              postboksNrSoker: '12603 Denmark Drive',
              bygningSoker: 'Apt.556',
              postkodeSoker: 'VA 22071-9945',
              poststedSoker: 'Herndon',
              regionSoker: 'Dulles',
              landSoker: 'USA',
            },
          };
          const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
          expect(forsteside.ukjentBrukerPersoninfo).toBe(
            'Solan Gundersen, 12603 Denmark Drive, Apt.556, VA 22071-9945 Herndon, Dulles, USA.',
          );
        });
      });
    });
  });
});
