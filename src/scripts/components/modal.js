// Обработка нажатия клавиши Esc
const closeByEscape = (e) => {
  if (e.key === "Escape") {
    const openedPopup = document.querySelector(".popup_is-opened");
    if (openedPopup) {
      closeModalWindow(openedPopup);
    }
  }
};

// Функция открытия попапа
export const openModalWindow = (popupElement) => {
  popupElement.classList.add("popup_is-opened");
  document.addEventListener("keyup", closeByEscape);
};

// Функция закрытия попапа
export const closeModalWindow = (popupElement) => {
  popupElement.classList.remove("popup_is-opened");
  document.removeEventListener("keyup", closeByEscape);
};

// Установка базовых слушателей на закрытие (крестик и клик мимо)
export const setCloseModalWindowEventListeners = (popupElement) => {
  const btnClose = popupElement.querySelector(".popup__close");
  
  btnClose.addEventListener("click", () => closeModalWindow(popupElement));

  popupElement.addEventListener("mousedown", (e) => {
    // Если клик пришелся строго на фон (оверлей), закрываем модалку
    if (e.target.classList.contains("popup")) {
      closeModalWindow(popupElement);
    }
  });
};
