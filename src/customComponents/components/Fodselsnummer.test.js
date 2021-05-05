import Fodselsnummer, { computeK1, computeK2 } from "./Fodselsnummer";
import Harness from "../../../test/harness";
import comp2 from "./fixtures/comp2";
import { fodselsNummerDNummerSchema } from "../../Forms/FormBuilderOptions";
import _ from "lodash";

describe("Fodselsnummer", () => {
  it("should generate a valid D-nummer", () => {
    const rawData = "410170000";
    const k1 = computeK1(rawData);
    const slightlyCooked = rawData + k1.toString();
    expect(slightlyCooked).toEqual("4101700001");
    const k2 = computeK2(slightlyCooked);
    const completelyCooked = slightlyCooked + k2.toString();
    expect(completelyCooked).toEqual("41017000010");
  });

  test("asdf", (done) => {
    let schema = fodselsNummerDNummerSchema();
    // return Harness.testCreate(Fodselsnummer, _.merge({}, schema))
    //   .then((component) => {
    //     return Harness.testInvalid(component, '12', schema.key, 'Dette er ikke et gyldig fødselsnummer eller D-nummer').then(() => component);
    //   })
    //   .then((component) => {
    //     return Harness.testValid(component, '12345678911').then(() => component);
    //   });
    return Harness.testCreate(Fodselsnummer, _.merge({}, schema))
      .then((component) =>
        Harness.testComponent(
          component,
          {
            bad: {
              value: "11",
              field: schema.key,
              error: undefined,
            },
            good: {
              value: "12345678911",
            },
          },
          done
        )
      )
      .catch(done);
  });
});
