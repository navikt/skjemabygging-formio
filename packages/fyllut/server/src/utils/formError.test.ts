import { logger } from "../logger";
import { containsIgnoredString, logFormNotFound } from "./formError";

vi.mock("../logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("containsIgnoredString", () => {
  it("returns true when ignored string is present", () => {
    expect(containsIgnoredString("/core/index")).toBe(true);
    expect(containsIgnoredString("login.php")).toBe(true);
    expect(containsIgnoredString("admin/config")).toBe(true);
  });

  it("returns false when ignored string is not present", () => {
    expect(containsIgnoredString("nonExistentPath")).toBe(false);
    expect(containsIgnoredString("nav123456")).toBe(false);
  });

  it("is case insensitive", () => {
    expect(containsIgnoredString("AdmiN/index")).toBe(true);
    expect(containsIgnoredString("Core/Index")).toBe(true);
  });
});

describe("logFormNotFound", () => {
  beforeEach(() => {
    (logger.error as vi.Mock).mockClear();
  });

  it("calls logger.error when path doesn't contain ignored string", () => {
    logFormNotFound("nonExistentPath");
    expect(logger.error).toHaveBeenCalled();
  });

  it("does not call logger.error when path contains ignored string", () => {
    logFormNotFound("index.php");
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("logger.error is called with correct arguments", () => {
    const path = "nonExistentPath";
    logFormNotFound(path);
    expect(logger.error).toHaveBeenCalledWith("Form not found", { formPath: path });
  });
});
