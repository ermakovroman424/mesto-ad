// Вспомогательная функция: проверяет, есть ли наш лайк в массиве лайков карточки
const checkUserLike = (likesArray, currentUserId) => {
  return likesArray.some((userData) => userData._id === currentUserId);
};

// Функция удаления карточки из DOM
export const deleteCard = (cardNode) => {
  cardNode.remove();
};

// Клонирование базового шаблона карточки из HTML
const getCardTemplate = () => {
  const templateNode = document.getElementById("card-template").content;
  return templateNode.querySelector(".card").cloneNode(true);
};

// Главная функция сборки карточки
export const createCardElement = (data, myId, callbacks) => {
  const { onPreviewPicture, onLikeCard, onDeleteCard } = callbacks;
  const newCard = getCardTemplate();

  const btnLike = newCard.querySelector(".card__like-button");
  const btnDelete = newCard.querySelector(".card__control-button_type_delete");
  const imgElement = newCard.querySelector(".card__image");
  const titleElement = newCard.querySelector(".card__title");
  const likesCounter = newCard.querySelector(".card__like-count");

  imgElement.src = data.link;
  imgElement.alt = data.name;
  titleElement.textContent = data.name;
  likesCounter.textContent = data.likes.length;

  // Отрисовка состояния лайка при загрузке
  if (checkUserLike(data.likes, myId)) {
    btnLike.classList.add("card__like-button_is-active");
  }

  // Настройка кнопки удаления (оставляем только на своих карточках)
  if (data.owner._id !== myId) {
    btnDelete.remove();
  } else if (onDeleteCard) {
    btnDelete.addEventListener("click", () => onDeleteCard(data._id, newCard));
  }

  // Обработчик лайка
  if (onLikeCard) {
    btnLike.addEventListener("click", () => {
      const willBeLiked = btnLike.classList.contains("card__like-button_is-active");
      onLikeCard(data._id, !willBeLiked, newCard); 
    });
  }

  // Обработчик клика по картинке
  if (onPreviewPicture) {
    imgElement.addEventListener("click", () => {
      onPreviewPicture({ name: data.name, link: data.link });
    });
  }

  return newCard;
};

// Обновление визуала лайка после ответа сервера
export const updateCardLikeStatus = (cardNode, isLikedNow, totalLikes) => {
  const btnLike = cardNode.querySelector(".card__like-button");
  const likesCounter = cardNode.querySelector(".card__like-count");

  btnLike.classList.toggle("card__like-button_is-active", isLikedNow);
  likesCounter.textContent = totalLikes;
};
