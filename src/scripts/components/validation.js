// Показ ошибки ввода
const displayInputError = (formNode, inputNode, message, settings) => {
  const errorContainer = formNode.querySelector(`#${inputNode.id}-error`);
  if (!errorContainer) return;

  inputNode.classList.add(settings.inputErrorClass);
  errorContainer.textContent = message;
  errorContainer.classList.add(settings.errorClass);
};

// Скрытие ошибки ввода
const hideInputError = (formNode, inputNode, settings) => {
  const errorContainer = formNode.querySelector(`#${inputNode.id}-error`);
  if (!errorContainer) return;

  inputNode.classList.remove(settings.inputErrorClass);
  errorContainer.classList.remove(settings.errorClass);
  errorContainer.textContent = "";
};

// Проверка одного поля на валидность
const validateField = (formNode, inputNode, settings) => {
  if (!inputNode.validity.valid) {
    const customMessage = inputNode.dataset.errorMessage;
    const errorText = (inputNode.validity.patternMismatch && customMessage) 
      ? customMessage 
      : inputNode.validationMessage;
      
    displayInputError(formNode, inputNode, errorText, settings);
    return false;
  } 
  
  hideInputError(formNode, inputNode, settings);
  return true;
};

// Проверка наличия хотя бы одного невалидного поля
const checkFormInvalidity = (inputs) => {
  return inputs.some((input) => !input.validity.valid);
};

// Переключение активности кнопки сабмита
const updateSubmitButton = (inputs, btnSubmit, settings) => {
  if (checkFormInvalidity(inputs)) {
    btnSubmit.disabled = true;
    btnSubmit.classList.add(settings.inactiveButtonClass);
  } else {
    btnSubmit.disabled = false;
    btnSubmit.classList.remove(settings.inactiveButtonClass);
  }
};

// Навешивание слушателей на все инпуты внутри формы
const bindFormEvents = (formNode, settings) => {
  const inputs = Array.from(formNode.querySelectorAll(settings.inputSelector));
  const btnSubmit = formNode.querySelector(settings.submitButtonSelector);

  if (inputs.length > 0) {
    updateSubmitButton(inputs, btnSubmit, settings);
  }

  inputs.forEach((inputNode) => {
    inputNode.addEventListener("input", () => {
      validateField(formNode, inputNode, settings);
      updateSubmitButton(inputs, btnSubmit, settings);
    });
  });
};

// Очистка всех ошибок формы (используется при открытии попапов)
export const clearValidation = (formNode, settings) => {
  const inputs = Array.from(formNode.querySelectorAll(settings.inputSelector));
  const btnSubmit = formNode.querySelector(settings.submitButtonSelector);

  inputs.forEach((inputNode) => hideInputError(formNode, inputNode, settings));
  
  btnSubmit.disabled = true;
  btnSubmit.classList.add(settings.inactiveButtonClass);
};

// Точка входа: запуск валидации для всех форм на странице
export const enableValidation = (settings) => {
  const forms = Array.from(document.querySelectorAll(settings.formSelector));
  forms.forEach((formNode) => {
    bindFormEvents(formNode, settings);
  });
};