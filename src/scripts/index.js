// Импорт главного файла стилей (необходимо для сборщика Vite)
import "../pages/index.css";

// Импорт функций для рендера карточек и работы с модальными окнами
import { createCardElement, deleteCard, updateCardLikeStatus } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// Импорт методов для взаимодействия с сервером (API)
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard as apiDeleteCard,
  changeLikeCardStatus,
} from "./components/api.js";

// Глобальная переменная для хранения уникального ID текущего пользователя
let myUserId = null;

// Объект для временного хранения данных карточки, которую мы хотим удалить
let pendingCardToDelete = {
  id: null,
  element: null,
};

// Основные DOM-узлы (контейнеры и элементы профиля)
const cardsContainer = document.querySelector(".places__list");
const nameProfileNode = document.querySelector(".profile__title");
const jobProfileNode = document.querySelector(".profile__description");
const avatarProfileNode = document.querySelector(".profile__image");

// Кнопки интерфейса, открывающие попапы
const btnEditProfile = document.querySelector(".profile__edit-button");
const btnAddCard = document.querySelector(".profile__add-button");
const siteLogoBtn = document.querySelector(".logo"); 

// DOM-элементы: Редактирование профиля
const popupEditProfile = document.querySelector(".popup_type_edit");
const formEditProfile = popupEditProfile.querySelector(".popup__form");
const inputName = formEditProfile.querySelector(".popup__input_type_name");
const inputJob = formEditProfile.querySelector(".popup__input_type_description");
const btnSubmitProfile = formEditProfile.querySelector(".popup__button");

// DOM-элементы: Добавление новой карточки
const popupAddCard = document.querySelector(".popup_type_new-card");
const formAddCard = popupAddCard.querySelector(".popup__form");
const inputCardName = formAddCard.querySelector(".popup__input_type_card-name");
const inputCardLink = formAddCard.querySelector(".popup__input_type_url");
const btnSubmitCard = formAddCard.querySelector(".popup__button");

// DOM-элементы: Просмотр полноразмерного фото
const popupImageView = document.querySelector(".popup_type_image");
const fullImageElement = popupImageView.querySelector(".popup__image");
const captionImageElement = popupImageView.querySelector(".popup__caption");

// DOM-элементы: Обновление картинки аватара
const popupEditAvatar = document.querySelector(".popup_type_edit-avatar");
const formEditAvatar = popupEditAvatar.querySelector(".popup__form");
const inputAvatarLink = formEditAvatar.querySelector(".popup__input");
const btnSubmitAvatar = formEditAvatar.querySelector(".popup__button");

// DOM-элементы: Подтверждение удаления карточки
const popupConfirmDelete = document.querySelector(".popup_type_remove-card");
const formConfirmDelete = popupConfirmDelete.querySelector(".popup__form");
const btnSubmitDelete = formConfirmDelete.querySelector(".popup__button");

// DOM-элементы: Статистика пользователей
const popupUserStats = document.querySelector(".popup_type_info");
const statsTitle = popupUserStats.querySelector(".popup__title");
const statsInfoList = popupUserStats.querySelector(".popup__info");
const statsTextHeading = popupUserStats.querySelector(".popup__text");
const statsUsersList = popupUserStats.querySelector(".popup__list");

// Базовые настройки для валидатора форм
const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// Утилита: индикация загрузки на кнопках
const toggleLoadingState = (buttonElement, isItLoading, normalText = "Сохранить", loadingText = "Сохранение...") => {
  buttonElement.textContent = isItLoading ? loadingText : normalText;
};

// Утилита: форматирование даты
const getFormattedDate = (dateObject) => {
  return dateObject.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Утилита: генерация строки статистики
const buildInfoRow = (termText, descriptionText) => {
  const tmpl = document.getElementById("popup-info-definition-template");
  const rowNode = tmpl.content.querySelector(".popup__info-item").cloneNode(true);
  rowNode.querySelector(".popup__info-term").textContent = termText;
  rowNode.querySelector(".popup__info-description").textContent = descriptionText;
  return rowNode;
};

// Утилита: генерация бейджа пользователя
const buildUserBadge = (nameStr) => {
  const tmpl = document.getElementById("popup-info-user-preview-template");
  const badgeNode = tmpl.content.querySelector(".popup__list-item").cloneNode(true);
  badgeNode.textContent = nameStr;
  return badgeNode;
};

// Коллбэки для карточек
const onImageClick = ({ name, link }) => {
  fullImageElement.src = link;
  fullImageElement.alt = name;
  captionImageElement.textContent = name;
  openModalWindow(popupImageView);
};

const onCardLike = (cardId, isLiked, cardNode) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((serverData) => {
      updateCardLikeStatus(cardNode, isLiked, serverData.likes.length);
    })
    .catch((error) => console.error(`Сбой при постановке лайка: ${error}`));
};

const onCardDeleteIconClick = (cardId, cardNode) => {
  pendingCardToDelete.id = cardId;
  pendingCardToDelete.element = cardNode;
  openModalWindow(popupConfirmDelete);
};

// Обработчики сабмита форм
const submitDeleteConfirmation = (e) => {
  e.preventDefault();
  toggleLoadingState(btnSubmitDelete, true, "Да", "Удаление...");

  apiDeleteCard(pendingCardToDelete.id)
    .then(() => {
      deleteCard(pendingCardToDelete.element);
      closeModalWindow(popupConfirmDelete);
      pendingCardToDelete = { id: null, element: null }; 
    })
    .catch((err) => console.error(`Сбой при удалении карточки: ${err}`))
    .finally(() => {
      toggleLoadingState(btnSubmitDelete, false, "Да", "Удаление...");
    });
};

const submitProfileChanges = (e) => {
  e.preventDefault();
  toggleLoadingState(btnSubmitProfile, true);

  setUserInfo({
    name: inputName.value,
    about: inputJob.value,
  })
    .then((updatedUser) => {
      nameProfileNode.textContent = updatedUser.name;
      jobProfileNode.textContent = updatedUser.about;
      closeModalWindow(popupEditProfile);
    })
    .catch((err) => console.error(`Сбой обновления профиля: ${err}`))
    .finally(() => {
      toggleLoadingState(btnSubmitProfile, false);
    });
};

const submitAvatarUpdate = (e) => {
  e.preventDefault();
  toggleLoadingState(btnSubmitAvatar, true);

  setUserAvatar({ avatar: inputAvatarLink.value })
    .then((updatedUser) => {
      avatarProfileNode.style.backgroundImage = `url(${updatedUser.avatar})`;
      closeModalWindow(popupEditAvatar);
    })
    .catch((err) => console.error(`Сбой обновления аватара: ${err}`))
    .finally(() => {
      toggleLoadingState(btnSubmitAvatar, false);
    });
};

const submitNewCard = (e) => {
  e.preventDefault();
  toggleLoadingState(btnSubmitCard, true, "Создать", "Создание...");

  addCard({
    name: inputCardName.value,
    link: inputCardLink.value,
  })
    .then((serverCardObj) => {
      const newCardElement = createCardElement(serverCardObj, myUserId, {
        onPreviewPicture: onImageClick,
        onLikeCard: onCardLike,
        onDeleteCard: onCardDeleteIconClick,
      });
      cardsContainer.prepend(newCardElement);
      closeModalWindow(popupAddCard);
    })
    .catch((err) => console.error(`Сбой создания карточки: ${err}`))
    .finally(() => {
      toggleLoadingState(btnSubmitCard, false, "Создать", "Создание...");
    });
};

// Обработка клика по логотипу (доп. задание: статистика)
const onSiteLogoClick = () => {
  getCardList()
    .then((cardsArray) => {
      statsInfoList.innerHTML = "";
      statsUsersList.innerHTML = "";
      statsTitle.textContent = "Статистика пользователей";

      statsInfoList.append(
        buildInfoRow("Всего карточек:", String(cardsArray.length))
      );

      if (cardsArray.length > 0) {
        statsInfoList.append(
          buildInfoRow(
            "Первая создана:",
            getFormattedDate(new Date(cardsArray[cardsArray.length - 1].createdAt))
          )
        );
        statsInfoList.append(
          buildInfoRow(
            "Последняя создана:",
            getFormattedDate(new Date(cardsArray[0].createdAt))
          )
        );

        const statsMap = {};
        cardsArray.forEach((c) => {
          const authorId = c.owner._id;
          if (!statsMap[authorId]) {
            statsMap[authorId] = {
              total: 0,
              username: c.owner.name,
            };
          }
          statsMap[authorId].total++;
        });

        const usersData = Object.values(statsMap);
        const highestCount = Math.max(...usersData.map((usr) => usr.total));

        statsInfoList.append(
          buildInfoRow("Всего пользователей:", String(usersData.length))
        );
        statsInfoList.append(
          buildInfoRow("Максимум карточек от одного:", String(highestCount))
        );

        statsTextHeading.textContent = "Все пользователи:";
        usersData.forEach((usr) => {
          statsUsersList.append(buildUserBadge(usr.username));
        });
      } else {
        statsTextHeading.textContent = "";
      }

      openModalWindow(popupUserStats);
    })
    .catch((err) => console.error(`Ошибка при сборе статистики: ${err}`));
};

// Инициализация событий интерфейса
formEditProfile.addEventListener("submit", submitProfileChanges);
formAddCard.addEventListener("submit", submitNewCard);
formEditAvatar.addEventListener("submit", submitAvatarUpdate);
formConfirmDelete.addEventListener("submit", submitDeleteConfirmation);

btnEditProfile.addEventListener("click", () => {
  inputName.value = nameProfileNode.textContent;
  inputJob.value = jobProfileNode.textContent;
  clearValidation(formEditProfile, validationConfig);
  openModalWindow(popupEditProfile);
});

avatarProfileNode.addEventListener("click", () => {
  formEditAvatar.reset();
  clearValidation(formEditAvatar, validationConfig);
  openModalWindow(popupEditAvatar);
});

btnAddCard.addEventListener("click", () => {
  formAddCard.reset();
  clearValidation(formAddCard, validationConfig);
  openModalWindow(popupAddCard);
});

siteLogoBtn.addEventListener("click", onSiteLogoClick);

document.querySelectorAll(".popup").forEach((popupNode) => {
  setCloseModalWindowEventListeners(popupNode);
});

enableValidation(validationConfig);

// Старт приложения: загрузка данных с сервера
Promise.all([getUserInfo(), getCardList()])
  .then(([userProfile, cardsData]) => {
    myUserId = userProfile._id; 

    nameProfileNode.textContent = userProfile.name;
    jobProfileNode.textContent = userProfile.about;
    avatarProfileNode.style.backgroundImage = `url(${userProfile.avatar})`;

    cardsData.forEach((cardItem) => {
      const cardElement = createCardElement(cardItem, myUserId, {
        onPreviewPicture: onImageClick,
        onLikeCard: onCardLike,
        onDeleteCard: onCardDeleteIconClick,
      });
      cardsContainer.append(cardElement);
    });
  })
  .catch((err) => console.error(`Критическая ошибка загрузки: ${err}`));
