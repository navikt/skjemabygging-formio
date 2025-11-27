import { CheckboxGroupSubmissionData, Submission } from '../../form';
import { DataFetcherData, DataFetcherElement, DataFetcherUtil } from './index';

/**
 * This function is used to get a nested value from an object using a path,
 * e.g., with obj being { foo: { bar: { baz: 42 } } }, ["foo","bar","baz"] will return 42,
 * and ["foo","bar"] will return { baz: 42 }.
 * @param pathElements a list of strings representing the path to the value
 * @param obj
 * @returns value on the given path
 */
const getNestedValue = <T>(pathElements: string[], obj): T => pathElements.reduce((acc, key) => acc?.[key], obj);

const getSelectedItems = (items: DataFetcherElement[], userData): DataFetcherElement[] =>
  items.filter((item) => userData[item.value]);

const getMatchingItems = (items: DataFetcherElement[], matcher: Record<string, any>) => {
  return items.filter((item) =>
    Object.keys(matcher).some((matcherProp) => {
      return item[matcherProp] === matcher[matcherProp];
    }),
  );
};

const dataFetcher = (componentPath: string | undefined, submission: Submission): DataFetcherUtil => {
  const pathElements = componentPath?.split('.') || [];
  const userData = getNestedValue<CheckboxGroupSubmissionData>(pathElements, submission?.data);
  const apiResult = getNestedValue<DataFetcherData>(pathElements, submission?.metadata?.dataFetcher);

  const fetchSuccess = Array.isArray(apiResult?.data);
  const fetchFailure = !!apiResult?.fetchError;
  const fetchDisabled = !!apiResult?.fetchDisabled;
  const fetchDone = fetchDisabled ? undefined : fetchSuccess || fetchFailure;
  return {
    fetchDone,
    fetchDisabled,
    ready: fetchDone || fetchDisabled,
    empty: fetchSuccess ? apiResult?.data?.length === 0 : undefined,
    success: fetchDone ? fetchSuccess : undefined,
    failure: fetchDone ? fetchFailure : undefined,
    selected: (matcher) => {
      if (fetchSuccess) {
        const allSelectedItems = getSelectedItems(apiResult.data || [], userData);
        if (typeof matcher === 'string') {
          switch (matcher) {
            case 'COUNT':
              return allSelectedItems.filter((item) => item.value !== 'annet').length;
            case 'OTHER':
              return allSelectedItems.some((item) => item.value === 'annet');
            default:
              return undefined;
          }
        }
        return getMatchingItems(allSelectedItems, matcher).length > 0;
      }
      return undefined;
    },
    getAllSelected: () => getSelectedItems(apiResult.data || [], userData ?? {}),
    apiResult,
  };
};

export { dataFetcher };
