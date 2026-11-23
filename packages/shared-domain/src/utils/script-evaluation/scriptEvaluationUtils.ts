import getCheckConditionUtils from '../check-condition/checkCondition';
import getCustomUtils from '../formio/utilsCustom';
import { evaluateScript } from './evaluateScript';
import { getValueByKey } from './getValueByKey';

/**
 * The `utils` that form scripts get in the new renderer: the custom Nav helpers that navFormioUtils
 * adds, without Formio's own utils.
 */
const scriptUtils = { getValue: getValueByKey, ...getCustomUtils({ getValue: getValueByKey }) };

const { checkCondition } = getCheckConditionUtils(scriptUtils, evaluateScript);

const scriptEvaluationUtils = {
  evaluate: evaluateScript,
  utils: scriptUtils,
  checkCondition,
};

export { scriptEvaluationUtils };
