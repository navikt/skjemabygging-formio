import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen } from '@testing-library/react';
import moment from 'moment';
import FormStatusPanel from './FormStatusPanel';
import { allLanguagesInNorwegian } from './PublishedLanguages';
import { FormStatusProperties } from './types';

const now = moment().toISOString();
const earlier = moment(now).subtract('1', 'day').toISOString();

describe('FormStatusPanel', () => {
  describe('When form has changedAt date and no publish date', () => {
    const form: FormStatusProperties = { changedAt: now, changedBy: 'Jenny', status: 'draft' };

    beforeEach(() => {
      render(<FormStatusPanel formStatusProperties={form} />);
    });

    it("displays the 'Utkast' status", () => {
      expect(screen.getByText('Utkast')).toBeInTheDocument();
    });

    it("displays 'Lagret dato'", () => {
      expect(screen.getByText('Sist lagret:')).toBeInTheDocument();
    });

    it('displays name of modifier', () => {
      expect(screen.getByText('Jenny')).toBeInTheDocument();
    });

    it("does not display 'Sist publisert'", () => {
      expect(screen.queryByText('Sist publisert:')).toBeNull();
    });
  });

  describe('When form has published date that is the same as changedAt date', () => {
    const properties: FormStatusProperties = {
      changedAt: now,
      publishedAt: now,
      publishedBy: 'Jonny',
      status: 'published',
    };

    beforeEach(() => {
      render(<FormStatusPanel formStatusProperties={properties as Form} />);
    });

    it("displays the 'Publisert' status", () => {
      expect(screen.getByText('Publisert')).toBeInTheDocument();
    });

    it("displays 'Sist lagret'", () => {
      expect(screen.getByText('Sist lagret:')).toBeInTheDocument();
    });

    it("displays 'Sist publisert'", () => {
      expect(screen.getByText('Sist publisert:')).toBeInTheDocument();
    });

    it('displays name of publisher', () => {
      expect(screen.getByText('Jonny')).toBeInTheDocument();
    });
  });

  describe('When form has published date earlier than changedAt date', () => {
    const properties: FormStatusProperties = { changedAt: now, publishedAt: earlier, status: 'pending' };

    beforeEach(() => {
      render(<FormStatusPanel formStatusProperties={properties as FormStatusProperties} />);
    });

    it("displays the 'Upubliserte endringer' status", () => {
      expect(screen.getByText('Upubliserte endringer')).toBeInTheDocument();
    });

    it("displays 'Sist lagret'", () => {
      expect(screen.getByText('Sist lagret:')).toBeInTheDocument();
    });

    it("displays 'Sist publisert'", () => {
      expect(screen.getByText('Sist publisert:')).toBeInTheDocument();
    });
  });

  describe('When form has no changedAt date and no published date', () => {
    beforeEach(() => {
      render(<FormStatusPanel formStatusProperties={{} as FormStatusProperties} />);
    });

    it("displays the 'Ukjent status' status", () => {
      expect(screen.getByText('Ukjent status')).toBeInTheDocument();
    });

    it("displays 'Sist lagret'", () => {
      expect(screen.queryByText('Sist lagret:')).toBeNull();
    });

    it("displays 'Sist publisert'", () => {
      expect(screen.queryByText('Sist publisert:')).toBeNull();
    });
  });

  describe('When form is unpublished and changedAt date is same as or before unpublished date', () => {
    const properties: FormStatusProperties = { changedAt: now, publishedAt: now, status: 'unpublished' };

    beforeEach(() => {
      render(<FormStatusPanel formStatusProperties={properties as Form} />);
    });

    it('changedAt (date) is before unpublisheddate', () => {
      expect(screen.getByText('Avpublisert')).toBeInTheDocument();
    });
  });

  describe('When form is unpublished and changedAt date is after unpublished date', () => {
    const properties: FormStatusProperties = { changedAt: now, publishedAt: earlier, status: 'unpublished' };

    beforeEach(() => {
      render(<FormStatusPanel formStatusProperties={properties as Form} />);
    });

    it('changedAt (date) is after unpublisheddate', () => {
      expect(screen.getByText('Avpublisert')).toBeInTheDocument();
    });

    it("displays 'Sist lagret'", () => {
      expect(screen.getByText('Sist lagret:')).toBeInTheDocument();
    });

    it("does not display 'Sist publisert'", () => {
      expect(screen.queryByText('Sist publisert:')).not.toBeInTheDocument();
    });
  });

  describe('PublishedLanguages (array)', () => {
    it('displays nothing if form is not publised', () => {
      render(<FormStatusPanel formStatusProperties={{} as Form} />);
      expect(screen.queryByText('Publiserte språk:')).not.toBeInTheDocument();
    });

    it('displays nothing if publishedLanguages is undefined', () => {
      const form = {
        publishedAt: now,
        publishedLanguages: undefined,
      } as FormStatusProperties;
      render(<FormStatusPanel formStatusProperties={form} />);
      expect(screen.queryByText('Publiserte språk:')).not.toBeInTheDocument();
    });

    it('displays all published languages', () => {
      const publishedLanguages = ['en', 'nn', 'nb'];
      const form = {
        publishedAt: now,
        publishedLanguages,
      } as FormStatusProperties;
      render(<FormStatusPanel formStatusProperties={form} />);
      expect(screen.queryByText('Publiserte språk:')).toBeInTheDocument();
      publishedLanguages.forEach((langCode) => {
        expect(screen.queryByText(allLanguagesInNorwegian[langCode])).toBeInTheDocument();
      });
    });
  });

  describe('When form has status test', () => {
    const form = {
      changedAt: now,
      publishedAt: earlier,
      properties: {
        isTestForm: true,
      },
    } as FormStatusProperties;

    beforeEach(() => {
      render(<FormStatusPanel formStatusProperties={form} />);
    });

    it("displays the 'Testskjema' status even if published and changedAt is set", () => {
      expect(screen.getByText('Testskjema')).toBeInTheDocument();
    });
  });

  describe('Toggle diff button', () => {
    let setDiffOn;

    beforeEach(() => {
      setDiffOn = vi.fn();
    });

    describe('feature toggle enableDiff is true', () => {
      describe('form is published', () => {
        it("button text is 'Skjul' when diffOn is true", () => {
          const form: FormStatusProperties = { changedAt: now, publishedAt: earlier };
          render(
            <AppConfigProvider featureToggles={{ enableDiff: true }} diffOn={true} setDiffOn={setDiffOn}>
              <FormStatusPanel formStatusProperties={form as FormStatusProperties} />
            </AppConfigProvider>,
          );
          expect(screen.queryByRole('button', { name: 'Skjul endringer' })).toBeInTheDocument();
        });

        it("button text is 'Vis' when diffOn is false", () => {
          const form: FormStatusProperties = { changedAt: now, publishedAt: earlier };
          render(
            <AppConfigProvider featureToggles={{ enableDiff: true }} diffOn={false} setDiffOn={setDiffOn}>
              <FormStatusPanel formStatusProperties={form as FormStatusProperties} />
            </AppConfigProvider>,
          );
          expect(screen.queryByRole('button', { name: 'Vis endringer' })).toBeInTheDocument();
        });
      });

      describe('form is not published', () => {
        it('is not visible when form is not published', () => {
          const properties: FormStatusProperties = { changedAt: earlier, publishedAt: undefined };
          render(
            <AppConfigProvider featureToggles={{ enableDiff: true }} diffOn={true} setDiffOn={setDiffOn}>
              <FormStatusPanel formStatusProperties={properties as FormStatusProperties} />
            </AppConfigProvider>,
          );
          expect(screen.queryByRole('button', { name: 'Skjul endringer' })).not.toBeInTheDocument();
        });
      });
    });

    it('feature toggle enableDiff is false', () => {
      const properties: FormStatusProperties = { changedAt: now, publishedAt: earlier };
      render(
        <AppConfigProvider featureToggles={{ enableDiff: false }} diffOn={true} setDiffOn={setDiffOn}>
          <FormStatusPanel formStatusProperties={properties as FormStatusProperties} />
        </AppConfigProvider>,
      );
      expect(screen.queryByRole('button', { name: 'Skjul endringer' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Vis endringer' })).not.toBeInTheDocument();
    });
  });
});
