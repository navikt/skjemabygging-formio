import FormioUtils from 'formiojs/utils';
import BaseComponent from './BaseComponent';

/**
 * The focus and blur handlers are copied from Formio Component#addFocusBlurEvents.
 * Added support for focused element inside the component and skip emit.
 */

type Opts = {
  skipEmit?: boolean;
  focusedElementName?: any;
};

export const focusHandler =
  (thisComponent: BaseComponent, opts: Opts = {}) =>
  () => {
    const focusedComponent = thisComponent.getFocusedComponent();
    const focusedElementName = thisComponent.getFocusedElementName();
    if (
      focusedComponent !== thisComponent ||
      (opts.focusedElementName && focusedElementName !== opts.focusedElementName)
    ) {
      if (thisComponent.root.pendingBlur) {
        thisComponent.root.pendingBlur();
      }
      thisComponent.setFocusedComponent(thisComponent, opts.focusedElementName);
      if (!opts.skipEmit) {
        thisComponent.emit('focus', thisComponent);
      }
    } else if (focusedComponent === thisComponent && thisComponent.root.pendingBlur) {
      thisComponent.root.pendingBlur.cancel();
      thisComponent.root.pendingBlur = null;
    }
  };

export const blurHandler =
  (thisComponent: BaseComponent, opts: Opts = {}) =>
  () => {
    thisComponent.root.pendingBlur = FormioUtils.delay(() => {
      if (!opts.skipEmit) {
        thisComponent.emit('blur', thisComponent);
      }
      if (thisComponent.component?.validateOn === 'blur') {
        thisComponent.root.triggerChange(
          { fromBlur: true },
          {
            instance: thisComponent,
            component: thisComponent.component,
            value: thisComponent.dataValue,
            flags: { fromBlur: true },
          },
        );
      }
      const focusedComponent = thisComponent.getFocusedComponent();
      const focusedElementName = thisComponent.getFocusedElementName();
      // only remove focused component on blur if this component was the focused component
      if (
        focusedComponent === thisComponent &&
        (!focusedElementName || focusedElementName === opts.focusedElementName)
      ) {
        thisComponent.setFocusedComponent(null);
        thisComponent.root.pendingBlur = null;
      }
    });
  };
