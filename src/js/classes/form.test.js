import { Form } from "./Form.js";

function createMockForm() {
  document.body.innerHTML = `
        <div class="modal">
            <form class="form">
                <div class="form-group">
                    <input type="text" class="coordinates-input">
                    <button class="ok-btn">OK</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
}

describe("Form validation tests", () => {
  let form;

  beforeEach(() => {
    createMockForm();
    form = new Form(".form");
  });

  test("should accept valid coordinate formats", () => {
    const validInputs = [
      "51.50851, -0.12572",
      "51.50851,-0.12572",
      "[51.50851, -0.12572]",
      "51.50851, -0.12572",
      "[51.50851,-0.12572]",
    ];

    validInputs.forEach((input) => {
      jest.spyOn(form, "_showError").mockImplementation(() => {});

      form.input.value = input;
      const isValid = form._validateCoordinates();

      expect(isValid).toBe(true);
      expect(form._showError).not.toHaveBeenCalled();
    });
  });

  test("should format coordinates to [lat, lon] format", () => {
    const testCases = [
      { input: "51.50851, -0.12572", expected: "[51.50851, -0.12572]" },
      { input: "51.50851,-0.12572", expected: "[51.50851, -0.12572]" },
      { input: "[51.50851, -0.12572]", expected: "[51.50851, -0.12572]" },
      { input: "[ 51.50851 , -0.12572 ]", expected: "[51.50851, -0.12572]" },
    ];

    testCases.forEach(({ input, expected }) => {
      const formatted = form._formatCoordinates(input);
      expect(formatted).toBe(expected);
    });
  });
});
