import FormioUtils from 'formiojs/utils';
import BaseComponent from './BaseComponent';

type Opts = {
  skipEmit?: boolean;
  focusedValue?: any;
};

export const focusHandler =
  (thisComponent: BaseComponent, opts: Opts = {}) =>
  () => {
    const focusedComponent = thisComponent.getFocusedComponent();
    if (focusedComponent !== thisComponent) {
      if (thisComponent.root.pendingBlur) {
        thisComponent.root.pendingBlur();
      }
      thisComponent.setFocusedComponent(thisComponent, opts.focusedValue);
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
      const focusedValue = thisComponent.getFocusedValue();
      if (focusedComponent === thisComponent && (!focusedValue || focusedValue === opts.focusedValue)) {
        thisComponent.setFocusedComponent(null);
        thisComponent.root.pendingBlur = null;
      }
    });
  };
