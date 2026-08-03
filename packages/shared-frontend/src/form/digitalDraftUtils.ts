const FORCE_MELLOMLAGRING_QUERY_PARAM = 'forceMellomlagring';

type ActiveTask = {
  innsendingsId: string;
  soknadstype: 'soknad' | 'ettersendelse';
};

type DigitalDraftResumeAction = { type: 'none' } | { type: 'resume'; innsendingsId: string } | { type: 'active-tasks' };

const buildDigitalFormSearch = (search: string, updates: Record<string, string | undefined> = {}): string => {
  const searchParams = new URLSearchParams(search);
  searchParams.set('sub', 'digital');

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      searchParams.delete(key);
      return;
    }
    searchParams.set(key, value);
  });

  const nextSearch = searchParams.toString();
  return nextSearch ? `?${nextSearch}` : '';
};

const resolveDigitalDraftResume = (search: string, activeTasks: ActiveTask[]): DigitalDraftResumeAction => {
  const searchParams = new URLSearchParams(search);

  if (searchParams.has('innsendingsId') || searchParams.get(FORCE_MELLOMLAGRING_QUERY_PARAM) === 'true') {
    return { type: 'none' };
  }

  const draftTasks = activeTasks.filter((task) => task.soknadstype === 'soknad');
  if (draftTasks.length === 1 && activeTasks.length === 1) {
    return { type: 'resume', innsendingsId: draftTasks[0].innsendingsId };
  }

  if (activeTasks.length > 0) {
    return { type: 'active-tasks' };
  }

  return { type: 'none' };
};

const shouldUseLegacyPageForNewRenderer = (routePath?: string): boolean =>
  routePath === 'legitimasjon' || routePath === 'pdf' || routePath === 'paabegynt';

const isSoknadAlreadyExistsResponse = (response: unknown): response is { status: 'soknadAlreadyExists' } =>
  typeof response === 'object' &&
  response !== null &&
  'status' in response &&
  response.status === 'soknadAlreadyExists';

export {
  buildDigitalFormSearch,
  isSoknadAlreadyExistsResponse,
  resolveDigitalDraftResume,
  shouldUseLegacyPageForNewRenderer,
};
export type { ActiveTask, DigitalDraftResumeAction };
