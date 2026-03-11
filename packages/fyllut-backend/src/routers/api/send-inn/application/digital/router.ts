import { paramValidation } from '@navikt/skjemadigitalisering-shared-backend';
import express from 'express';
import multer from 'multer';
import { initApiConfig } from '../../../api-helper';
import applicationEndpoints from './application';
import attachmentsEndpoints from './attachments';

const upload = multer();
const { azurePdfGeneratorToken } = initApiConfig();

const router = express.Router();
router.param('innsendingsId', paramValidation.innsendingsId);
router.param('attachmentId', paramValidation.attachmentId);
router.param('fileId', paramValidation.fileId);

router.post('/:innsendingsId/attachments/:attachmentId', upload.single('filinnhold'), attachmentsEndpoints.post);
router.delete('/:innsendingsId/attachments/:attachmentId', attachmentsEndpoints.delete);
router.delete('/:innsendingsId/attachments/:attachmentId/*fileId', attachmentsEndpoints.delete);
router.post('/:innsendingsId', azurePdfGeneratorToken, applicationEndpoints.post);

export default router;
