import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import FeedbackProvider, { useFeedbackEmit, useFeedbackMessages } from "./FeedbackContext";

const renderFeedbackContext = (onMessagesUpdated, execute) => {
  const TestFeedbackMessages = ({ onMessagesUpdated }) => {
    const messages = useFeedbackMessages();
    onMessagesUpdated(messages);
    return <></>;
  };

  const TestFeedbackEmit = ({ execute }) => {
    const emit = useFeedbackEmit();
    useEffect(() => execute(emit), []);
    return <></>;
  };

  render(
    <FeedbackProvider>
      <>
        <TestFeedbackEmit execute={execute} />
        <TestFeedbackMessages onMessagesUpdated={onMessagesUpdated} />
      </>
    </FeedbackProvider>
  );
};

const getLatest = (mockFunction) => {
  const mockCalls = mockFunction.mock.calls;
  return mockCalls[mockCalls.length - 1][0];
};

describe("FeedbackContext", () => {
  let onMessagesUpdated;
  let execute;

  describe("useFeedbackMessages", () => {
    beforeEach(() => {
      onMessagesUpdated = jest.fn();
      execute = jest.fn().mockImplementation((emit) => {
        emit.success("Success message");
        emit.error("Error message");
        emit.warning("Warning message");
      });
      renderFeedbackContext(onMessagesUpdated, execute);
    });

    afterEach(() => {
      onMessagesUpdated.mockClear();
      execute.mockClear();
    });

    it("returns emitted messages", () => {
      const messages = getLatest(onMessagesUpdated);
      expect(messages[0].message).toBe("Success message");
      expect(messages[1].message).toBe("Error message");
      expect(messages[2].message).toBe("Warning message");
    });

    it("returns an updated list when a message is removed", () => {
      const messages = getLatest(onMessagesUpdated);
      expect(messages).toHaveLength(3);
      act(() => messages[1].clear());
      const updatedMessages = getLatest(onMessagesUpdated);
      expect(updatedMessages).toHaveLength(2);
    });
  });
});
