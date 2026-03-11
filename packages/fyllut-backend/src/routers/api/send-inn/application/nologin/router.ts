import { paramValidation } from '@navikt/skjemadigitalisering-shared-backend';
import express from 'express';
import multer from 'multer';
import { initApiConfig } from '../../../api-helper';
import applicationEndpoints from './application';
import attachmentsEndpoints from './attachments';

const upload = multer();
const { azurePdfGeneratorToken } = initApiConfig();

const router = express.Router();
router.param('attachmentId', paramValidation.attachmentId);
router.param('fileId', paramValidation.fileId);

router.post('/attachments/:attachmentId', upload.single('filinnhold'), attachmentsEndpoints.post);
router.delete('/attachments/:attachmentId', attachmentsEndpoints.delete);
router.delete('/attachments/:attachmentId/*fileId', attachmentsEndpoints.delete);
router.delete('/', attachmentsEndpoints.delete);
router.post('/', azurePdfGeneratorToken, applicationEndpoints.post);

export default router;
