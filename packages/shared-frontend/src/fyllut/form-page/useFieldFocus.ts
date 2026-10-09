import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

const useFieldFocus = () => {
  const { key, pathname, search, hash, state } = useLocation();
  const navigate = useNavigate();
  const stateFocusId =
    typeof state === 'object' && state && typeof state.focusId === 'string' ? state.focusId : undefined;
  const targetId = stateFocusId || hash.slice(1);
  const completedRequestRef = useRef<{ key: string; targetId: string }>();

  useEffect(() => {
    if (!targetId) {
      completedRequestRef.current = undefined;
      return;
    }
    if (completedRequestRef.current?.key === key && completedRequestRef.current.targetId === targetId) {
      return;
    }

    let animationFrame: number | undefined;
    const completeRequest = () => {
      completedRequestRef.current = { key, targetId };
      const { focusId: _focusId, ...remainingState } = state ?? {};
      // Consume both error-link state and direct hashes without adding a history entry.
      navigate({ pathname, search, hash: '' }, { replace: true, state: remainingState });
    };
    const focusField = (remainingAttempts = 20) => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ block: 'center' });
        const focusTarget =
          element.matches('input, select, textarea, button, [tabindex]') || element.tabIndex >= 0
            ? element
            : element.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]');
        if (focusTarget) {
          focusTarget.focus({ preventScroll: true });
          if (document.activeElement === focusTarget) {
            completeRequest();
            return;
          }
        }
      }

      if (remainingAttempts > 1) {
        animationFrame = requestAnimationFrame(() => focusField(remainingAttempts - 1));
      } else {
        completeRequest();
      }
    };

    focusField();
    return () => {
      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [key, navigate, pathname, search, state, targetId]);
};

export { useFieldFocus };
