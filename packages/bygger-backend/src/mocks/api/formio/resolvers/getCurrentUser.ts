import { HttpResponse } from 'msw';
import { mswUtils } from '../../../index';

const getCurrentUser = async ({ request }) => {
  const mockResponse = mswUtils.find(request.url);
  if (mockResponse) {
    const { status, body } = mockResponse;
    return new HttpResponse(body, { status });
  }
  const user = {
    data: {
      email: 'mock@mail.no',
    },
  };
  return HttpResponse.json(user, { status: 200 });
};

export default getCurrentUser;
