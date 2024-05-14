import FormioUtils from 'formiojs/utils';
import BuilderUtils from 'formiojs/utils/builder';

const originalUniqify = BuilderUtils.uniquify;

BuilderUtils.uniquify = function (container, component) {
  FormioUtils.eachComponent(
    [component],
    (component) => {
      component.navId = FormioUtils.getRandomComponentId();
    },
    true,
  );

  originalUniqify(container, component);
};
