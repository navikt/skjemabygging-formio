import { computeK1, computeK2 } from "./Fodselsnummer";

it("should generate a valid D-nummer", () => {
  const rawData = "410170000";
  const k1 = computeK1(rawData);
  const slightlyCooked = rawData + k1.toString();
  expect(slightlyCooked).toEqual("4101700001");
  const k2 = computeK2(slightlyCooked);
  const completelyCooked = slightlyCooked + k2.toString();
  expect(completelyCooked).toEqual("41017000010");
});
