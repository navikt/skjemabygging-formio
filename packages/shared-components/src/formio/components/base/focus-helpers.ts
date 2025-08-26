import FormioUtils from '@formio/js/utils';
import FormioReactComponent from './FormioReactComponent';

/**
 * The focus and blur handlers are copied from Formio Component#addFocusBlurEvents.
 * Added support for focused element inside the component and skip emit.
 */

type Opts = {
  skipEmit?: boolean;
  elementId?: any;
};

export const focusHandler =
  (thisComponent: FormioReactComponent, opts: Opts = {}) =>
  () => {
    const focusedComponent = thisComponent.getFocusedComponent();
    const focusedElementId = thisComponent.getFocusedElementId();
    if (focusedComponent !== thisComponent || (opts.elementId && focusedElementId !== opts.elementId)) {
      if (thisComponent.root.pendingBlur) {
        thisComponent.root.pendingBlur();
      }
      thisComponent.setFocusedComponent(thisComponent, opts.elementId);
      if (!opts.skipEmit) {
        thisComponent.emit('focus', thisComponent);
      }
    } else if (focusedComponent === thisComponent && thisComponent.root.pendingBlur) {
      thisComponent.root.pendingBlur.cancel();
      thisComponent.root.pendingBlur = null;
    }
  };

export const blurHandler =
  (thisComponent: FormioReactComponent, opts: Opts = {}) =>
  () => {
    // @ts-expect-error delay exists but not in type
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
      const focusedElementId = thisComponent.getFocusedElementId();
      // only remove focused component on blur if this component was the focused component
      if (focusedComponent === thisComponent && (!focusedElementId || focusedElementId === opts.elementId)) {
        thisComponent.setFocusedComponent(null);
        thisComponent.root.pendingBlur = null;
      }
    });
  };
