// Настройки подключения к серверу (твои уникальные данные)
const apiConfig = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "284c4e2b-44a9-4982-bc3e-c61c047543bf",
    "Content-Type": "application/json",
  },
};

// Проверка статуса ответа от сервера
const checkServerResponse = (response) => {
  if (response.ok) {
    return response.json();
  }
  return Promise.reject(`Ошибка запроса: ${response.status}`);
};

export const getUserInfo = () => {
  return fetch(`${apiConfig.baseUrl}/users/me`, {
    headers: apiConfig.headers,
  }).then(checkServerResponse);
};

export const getCardList = () => {
  return fetch(`${apiConfig.baseUrl}/cards`, {
    headers: apiConfig.headers,
  }).then(checkServerResponse);
};

export const setUserInfo = ({ name, about }) => {
  return fetch(`${apiConfig.baseUrl}/users/me`, {
    method: "PATCH",
    headers: apiConfig.headers,
    body: JSON.stringify({ name, about }),
  }).then(checkServerResponse);
};

export const setUserAvatar = ({ avatar }) => {
  return fetch(`${apiConfig.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: apiConfig.headers,
    body: JSON.stringify({ avatar }),
  }).then(checkServerResponse);
};

export const addCard = ({ name, link }) => {
  return fetch(`${apiConfig.baseUrl}/cards`, {
    method: "POST",
    headers: apiConfig.headers,
    body: JSON.stringify({ name, link }),
  }).then(checkServerResponse);
};

export const deleteCard = (cardId) => {
  return fetch(`${apiConfig.baseUrl}/cards/${cardId}`, {
    method: "DELETE",
    headers: apiConfig.headers,
  }).then(checkServerResponse);
};

export const changeLikeCardStatus = (cardId, isLiked) => {
  return fetch(`${apiConfig.baseUrl}/cards/likes/${cardId}`, {
    method: isLiked ? "PUT" : "DELETE",
    headers: apiConfig.headers,
  }).then(checkServerResponse);
};