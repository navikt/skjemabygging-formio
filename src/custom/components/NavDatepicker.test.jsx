import NavDatepicker from "./NavDatepicker";

it("should generate the correct datastructure", () => {
  const editForm = NavDatepicker.editForm();
  expect(editForm).toEqual({
    flesk: "duppe",
  });
});
