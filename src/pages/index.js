import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";
import "./index.css";
import pencilSrc from "../images/pencil.svg";
import plusSrc from "../images/plus.svg";
import logoSrc from "../images/logo.svg";
import pencilWhiteSrc from "../images/pencilWhite.svg";
import { setButtonText } from "../utils/helpers.js";

/* -------------------------------------------------------------------------- */
/* Elements                                  */
/* -------------------------------------------------------------------------- */

// Profile Elements
const profileEditButton = document.querySelector(".profile__edit-btn");
const cardModalButton = document.querySelector(".profile__add-btn");
const profileAvatarButton = document.querySelector(".profile__avatar-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const avatarImage = document.getElementById("avatar");

// Modal Elements
const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input",
);

const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const cancelDeleteBtn = deleteModal.querySelector(
  ".modal__submit-btn_type_cancel",
);

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");

const cardsList = document.querySelector(".cards__list");

/* -------------------------------------------------------------------------- */
/* API                                    */
/* -------------------------------------------------------------------------- */

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "5f16e798-4e05-4f94-979f-54bc3bfb82d6",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, me]) => {
    cards.forEach((card) => {
      const cardEl = getCardElement(card);
      cardsList.append(cardEl);
    });
    avatarImage.src = me.avatar;
    profileName.textContent = me.name;
    profileDescription.textContent = me.about;
  })
  .catch(console.error);

/* -------------------------------------------------------------------------- */
/* Functions                                 */
/* -------------------------------------------------------------------------- */

function getCardElement(data) {
  const cardTemplate = document.querySelector("#card-template");
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  cardLikeButton.addEventListener("click", (evt) => {
    handleLike(evt, data._id);
  });

  cardDeleteButton.addEventListener("click", () => {
    handleDeleteCard(cardElement, data._id);
  });

  cardImage.addEventListener("click", () => {
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaption.textContent = data.name;
    openModal(previewModal);
  });

  if (data.isLiked) {
    cardLikeButton.classList.add("card__like-button_liked");
  }

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscape);
}

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const modalCurrentlyOpen = document.querySelector(".modal_opened");
    if (modalCurrentlyOpen) closeModal(modalCurrentlyOpen);
  }
}

/* -------------------------------------------------------------------------- */
/* Event Handlers                               */
/* -------------------------------------------------------------------------- */

let selectedCard, selectedCardId;

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Deleting...");
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleLike(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-button_liked");
  api
    .changeLikeStatus(id, isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-button_liked");
    })
    .catch(console.error);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .addCardInfo({
      name: cardNameInput.value,
      link: cardLinkInput.value,
    })
    .then((data) => {
      const cardEl = getCardElement(data);
      cardsList.prepend(cardEl);
      evt.target.reset();
      disableButton(cardSubmitBtn, settings);
      closeModal(cardModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .editAvatarInfo(avatarInput.value)
    .then((res) => {
      avatarImage.src = res.avatar;
      evt.target.reset();
      disableButton(avatarSubmitBtn, settings);
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

/* -------------------------------------------------------------------------- */
/* Listeners                                    */
/* -------------------------------------------------------------------------- */

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings,
  );
  openModal(editModal);
});

cardModalButton.addEventListener("click", () => openModal(cardModal));
profileAvatarButton.addEventListener("click", () => openModal(avatarModal));
cancelDeleteBtn.addEventListener("click", () => closeModal(deleteModal));

const modals = document.querySelectorAll(".modal");
modals.forEach((modal) => {
  modal.addEventListener("mousedown", (e) => {
    if (e.target === modal || e.target.classList.contains("modal__close-btn")) {
      closeModal(modal);
    }
  });
});

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);

// Image assets
document.getElementById("pencil").src = pencilSrc;
document.getElementById("plus").src = plusSrc;
document.getElementById("logo").src = logoSrc;
document.getElementById("profile-pencil-img").src = pencilWhiteSrc;

enableValidation(settings);
