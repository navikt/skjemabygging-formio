import { vi } from 'vitest';
import useNologinFileUpload from './nologinFileUpload';

const getFile = vi.fn();

vi.mock('./fileUploader', () => ({
  postFile: vi.fn(),
  deleteFiles: vi.fn(),
  getFile: (...args: any[]) => getFile(...args),
}));

describe('nologinFileUpload', () => {
  it('downloads file from digital application endpoint and forwards nologin token header', async () => {
    const innsendingsId = '12345678-1234-1234-1234-12345678abcd';
    const attachmentId = 'eiajfi8';
    const fileId = '12345678-1234-1234-1234-123456789abc';
    const token = 'nologin-token';
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'application/octet-stream' });
    getFile.mockResolvedValueOnce(blob);

    const { downloadFile } = useNologinFileUpload('digital', innsendingsId);
    const result = await downloadFile(attachmentId, fileId, token);

    expect(getFile).toHaveBeenCalledWith(
      `/fyllut/api/send-inn/digital-application/${innsendingsId}/attachments/${attachmentId}/${fileId}`,
      token,
    );
    expect(result).toBe(blob);
  });
});
