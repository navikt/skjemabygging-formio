const FILE_ACCEPT = '.pdf,.jpeg,.jpg,.docx,.doc,.odt,.rtf,.txt,.png,.tiff,.tif,.bmp,.gif';
const MAX_SIZE_ATTACHMENT_FILE_BYTES = 150 * 1024 * 1024;
const MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES = 150 * 1024 * 1024;

const fileUploadErrorParams = {
  maxFileSize: '150 MB',
  maxAttachmentSize: '150 MB',
};

export { FILE_ACCEPT, MAX_SIZE_ATTACHMENT_FILE_BYTES, MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES, fileUploadErrorParams };
