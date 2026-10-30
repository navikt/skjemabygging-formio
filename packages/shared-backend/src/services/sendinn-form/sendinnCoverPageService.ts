import {
  formsApiTranslationUtils,
  navFormUtils,
  NavUnitSelectComponent,
  normalizeSendinnAttachmentFilter,
  ResponseError,
  SendinnCoverPageRequest,
  SendinnCoverPageResult,
} from '@navikt/skjemadigitalisering-shared-domain';
import { CoverPageService } from '../cover-page';
import { createSubsequentSubmissionDownloadData } from '../cover-page/subsequentSubmission';
import { NavUnitService } from '../nav-unit';
import { SendinnFormService } from './sendinnFormService';

interface SendinnCoverPageService {
  downloadCoverPage: (request: SendinnCoverPageRequest) => Promise<SendinnCoverPageResult>;
}

const createSendinnCoverPageService = ({
  formService,
  coverPageService,
  navUnitService,
  getAccessToken,
  allowTestIdentityNumbers = false,
}: {
  formService: SendinnFormService;
  coverPageService: CoverPageService;
  navUnitService: NavUnitService;
  getAccessToken: () => Promise<string>;
  allowTestIdentityNumbers?: boolean;
}): SendinnCoverPageService => {
  const downloadCoverPage: SendinnCoverPageService['downloadCoverPage'] = async (request) => {
    const loaded = await formService.getForm({
      formPath: request.formPath,
      language: request.language,
      attachmentFilter: normalizeSendinnAttachmentFilter(request.attachmentFilter),
    });
    const translate = formsApiTranslationUtils.createTranslate(loaded.translations, loaded.language);
    const data = createSubsequentSubmissionDownloadData({
      form: loaded.form,
      submission: request.submission,
      language: loaded.language,
      translate,
      allowTestIdentityNumbers,
    });
    if (data.recipient?.navUnit) {
      const units = await (async () => {
        try {
          const result = await navUnitService.getNavUnits();
          if (
            !Array.isArray(result) ||
            !result.every((unit) => unit && typeof unit.enhetNr === 'string' && typeof unit.type === 'string')
          ) {
            throw new ResponseError('SERVICE_UNAVAILABLE', 'Invalid Nav unit response');
          }
          return result;
        } catch (error) {
          throw new ResponseError(
            'SERVICE_UNAVAILABLE',
            'Unable to load Nav units',
            error instanceof ResponseError ? error.correlationId : undefined,
          );
        }
      })();
      const field = navFormUtils
        .flattenComponents(loaded.form.components)
        .find(
          (component): component is NavUnitSelectComponent =>
            component.type === 'navUnitSelect' &&
            component.key === (data.collection === 'unidentified-person' ? 'navContactUnit' : 'navUnit'),
        );
      const filtered = units.filter((unit) => !field?.unitTypes?.length || field.unitTypes.includes(unit.type));
      const available = filtered.length ? filtered : units;
      if (!available.some((unit) => unit.enhetNr === data.recipient?.navUnit)) {
        throw new ResponseError('BAD_REQUEST', 'Selected Nav unit is unavailable');
      }
    }
    const accessToken = await getAccessToken();
    if (!accessToken) throw new ResponseError('SERVICE_UNAVAILABLE', 'Unable to authenticate cover page request');
    const pdf = await (async () => {
      try {
        return await coverPageService.downloadCoverPage({
          data,
          accessToken,
          languageCode: loaded.language,
          translate,
        });
      } catch (error) {
        throw new ResponseError(
          'SERVICE_UNAVAILABLE',
          'Unable to generate cover page',
          error instanceof ResponseError ? error.correlationId : undefined,
        );
      }
    })();
    if (
      !/^[A-Za-z0-9+/]+={0,2}$/.test(pdf) ||
      !Buffer.from(pdf, 'base64').subarray(0, 5).equals(Buffer.from('%PDF-'))
    ) {
      throw new ResponseError('SERVICE_UNAVAILABLE', 'Invalid cover page response');
    }
    return { pdf };
  };
  return { downloadCoverPage };
};

export { createSendinnCoverPageService };
export type { SendinnCoverPageService };
