import { HttpResponse } from 'msw';

const getCurrentUser = async () => {
  const user = {
    data: {
      email: 'mock@mail.no',
    },
  };
  return HttpResponse.json(user, { status: 200 });
};

export default getCurrentUser;
