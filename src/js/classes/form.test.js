import { Form } from "./Form.js";

describe("Form", () => {
  let form;

  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <form>
          <div>
            <input type="text" class="coordinates-input">
            <button class="ok-btn">OK</button>
            <button class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    `;

    form = new Form("form");
  });

  test("initialization test", () => {
    expect(form.form).toBeDefined();
    expect(form.input).toBeDefined();
    expect(form.okButton).toBeDefined();
    expect(form.cancelButton).toBeDefined();
    expect(form._isSending).toBe(false);
    expect(form.form.hasAttribute("novalidate")).toBe(true);
  });

  describe("show/hide test", () => {
    beforeEach(() => {
      form.form.parentElement.classList.add("_hidden");
    });

    test("show form", () => {
      const callback = jest.fn();
      form.show(callback);
      expect(form.successCallback).toBe(callback);
      expect(form.form.parentElement.classList.contains("_hidden")).toBe(false);
      expect(document.activeElement).toBe(form.input);
    });

    test("hide form", () => {
      form.input.value = "51.50851, -0.12572";
      form._isSending = true;
      form.hide();
      expect(form.form.parentElement.classList.contains("_hidden")).toBe(true);
      expect(form.input.value).toBe("");
      expect(form._isSending).toBe(false);
    });
  });

  describe("coordinates validation", () => {
    test("empty value - error", () => {
      form.input.value = "";
      const result = form._validateCoordinates();
      expect(result).toBe(false);
      const error = form.input.parentElement.querySelector(".wrong-field");
      expect(error.textContent).toBe("Введите координаты");
    });

    test("invalid values - error", () => {
      const invalidValues = [
        "51.50851 -0.12572",
        "test, test",
        "51.50851, -0.12572, 100",
      ];

      invalidValues.forEach((value) => {
        form.input.value = value;
        form._validateCoordinates();
        const error = form.input.parentElement.querySelector(".wrong-field");
        expect(error.textContent).toContain("Неверный формат");
        error.remove();
      });
    });

    test("invalid values, out of range - error", () => {
      const invalidCoords = ["100, 50", "-100, 50", "50, 200", "50, -200"];

      invalidCoords.forEach((value) => {
        form.input.value = value;
        form._validateCoordinates();
        const error = form.input.parentElement.querySelector(".wrong-field");
        expect(error.textContent).toBe("Недопустимые значения координат");
        error.remove();
      });
    });
  });

  describe("send form test", () => {
    test("send calls a callback with formatted coordinates", () => {
      const mockCallback = jest.fn();
      form.successCallback = mockCallback;
      form.input.value = "51.50851, -0.12572";

      form.send();
      expect(mockCallback).toHaveBeenCalledWith("[51.50851, -0.12572]");
      expect(form._isSending).toBe(false);
    });

    test("_handleSubmit blocks resending", () => {
      const event = { preventDefault: jest.fn() };
      form._isSending = true;

      form._handleSubmit(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test("_handleSubmit validates and sends on success", () => {
      const event = { preventDefault: jest.fn() };
      const mockCallback = jest.fn();
      form.successCallback = mockCallback;
      form.input.value = "51.50851, -0.12572";

      form._handleSubmit(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalled();
    });

    test("send without callback", () => {
      form.successCallback = null;
      form.input.value = "51.50851, -0.12572";

      const hideSpy = jest.spyOn(form, "hide");
      form.send();
      expect(hideSpy).toHaveBeenCalled();
    });
  });

  describe("events test", () => {
    test("input clears the error", () => {
      form._showError(form.input, "Ошибка");
      expect(
        form.input.parentElement.querySelector(".wrong-field"),
      ).not.toBeNull();

      form.input.dispatchEvent(new Event("input"));
      expect(form.input.parentElement.querySelector(".wrong-field")).toBeNull();
    });

    test("cancel button causes hide", () => {
      const hideSpy = jest.spyOn(form, "hide");

      form.cancelButton.click();
      expect(hideSpy).toHaveBeenCalled();
    });

    test("submit calls _handleSubmit", () => {
      const handleSubmitSpy = jest.spyOn(form, "_handleSubmit");

      form.form.dispatchEvent(new Event("submit"));
      expect(handleSubmitSpy).toHaveBeenCalled();
    });
  });

  describe("errors", () => {
    test("_showError creates an error element", () => {
      form._showError(form.input, "Тестовая ошибка");

      const error = form.input.parentElement.querySelector(".wrong-field");
      expect(error).not.toBeNull();
      expect(error.textContent).toBe("Тестовая ошибка");
      expect(error.className).toBe("wrong-field");
    });

    test("_showError does not create duplicates", () => {
      form._showError(form.input, "Первая ошибка");
      form._showError(form.input, "Вторая ошибка");

      const errors = form.input.parentElement.querySelectorAll(".wrong-field");
      expect(errors.length).toBe(1);
      expect(errors[0].textContent).toBe("Первая ошибка");
    });

    test("_hideError deletes the error element", () => {
      form._showError(form.input, "Ошибка");
      expect(
        form.input.parentElement.querySelector(".wrong-field"),
      ).not.toBeNull();

      form._hideError(form.input);
      expect(form.input.parentElement.querySelector(".wrong-field")).toBeNull();
    });

    test("_hideError does not fall if there is no error", () => {
      expect(() => {
        form._hideError(form.input);
      }).not.toThrow();
    });
  });

  describe("formatting coordinates", () => {
    test("formatting valide values", () => {
      const testCases = [
        { input: "51.50851, -0.12572", expected: "[51.50851, -0.12572]" },
        { input: "[51.50851, -0.12572]", expected: "[51.50851, -0.12572]" },
        { input: "51.5085, -0.1257", expected: "[51.50850, -0.12570]" },
        { input: "0, 0", expected: "[0.00000, 0.00000]" },
        { input: "-45.123456, 120.789012", expected: "[-45.12346, 120.78901]" },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = form._formatCoordinates(input);
        expect(result).toBe(expected);
      });
    });

    test("returns the original value for incorrect coordinates", () => {
      const invalidInputs = [
        "не координаты",
        "51.50851",
        "51.50851, -0.12572, 100",
        "abc, def",
      ];

      invalidInputs.forEach((input) => {
        const result = form._formatCoordinates(input);
        expect(result).toBe(input);
      });
    });
  });
});
