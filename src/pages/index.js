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
import avatarSrc from "../images/avatar.jpg";
import logoSrc from "../images/logo.svg";
import pencilWhiteSrc from "../images/pencilWhite.svg";
import { setButtonText } from "../utils/helpers.js";

const pencilImage = document.getElementById("pencil");
pencilImage.src = pencilSrc;

const plusImage = document.getElementById("plus");
plusImage.src = plusSrc;

const avatarImage = document.getElementById("avatar");

const logoImage = document.getElementById("logo");
logoImage.src = logoSrc;

const profilePencilImage = document.getElementById("profile-pencil-img");
profilePencilImage.src = pencilWhiteSrc;

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

// Avatar form element
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

//Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");

const profileEditButton = document.querySelector(".profile__edit-btn");
const cardModalButton = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileAvatarButton = document.querySelector(".profile__avatar-btn");
const profileDescription = document.querySelector(".profile__description");

const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input",
);
const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");
const previewModalCloseButton = previewModal.querySelector(
  ".modal__close-btn_type_preview",
);

function getCardElement(data) {
  // 1. Clone the template
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  // 2. FIND the elements inside the clone (This was the missing step!)
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");

  // 3. Set the data (image src, alt, and text)

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  // 4. Set up the event listeners
  cardLikeButton.addEventListener("click", (evt) => {
    handleLike(evt, data._id);
  });

  cardDeleteButton.addEventListener("click", (evt) => {
    handleDeleteCard(cardElement, data._id);
  });

  if (data.isLiked) {
    cardLikeButton.classList.add("card__like-button_liked");
  }

  // 5. Return the fully functional cardm
  return cardElement;
}

let selectedCard, selectedCardId;

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const modalCurrentlyOpen = document.querySelector(".modal_opened");
    closeModal(modalCurrentlyOpen);
  }
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  api
    .deleteCard(selectedCardId)
    .then(() => {})
    .catch(console.error);
}

function handleLike(evt, id) {
  evt.preventDefault();
  const isLiked = evt.target.classList.contains("card__like-button_liked");
  api
    .changeLikeStatus(id, isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-button_liked");
    })
    .catch(console.error);
}
function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

const modals = document.querySelectorAll(".modal");
modals.forEach((modal) => {
  modal.addEventListener("mousedown", (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
});

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscape);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();

  const SubmitBtn = evt.submitter;
  setButtonText(SubmitBtn, true);
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
      setButtonText(SubmitBtn, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  api
    .addCardInfo({
      name: cardNameInput.value,
      link: cardLinkInput.value,
    })
    .then((data) => {
      const inputValues = { name: data.name, link: data.link };
      console.log(inputValues);
      const cardEl = getCardElement(inputValues);
      cardsList.prepend(cardEl);
      evt.target.reset();
      disableButton(cardSubmitBtn, settings);
      closeModal(cardModal);
    })
    .catch(console.error);
}

//TODO submission handler
function handleAvatarSubmit(evt) {
  evt.preventDefault();
  api
    .editAvatarInfo(avatarInput.value)
    .then((res) => {
      avatarImage.src = res.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error);
}

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

editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

profileAvatarButton.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

cardModalButton.addEventListener("click", () => {
  openModal(cardModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);

previewModalCloseButton.addEventListener("click", () => {
  closeModal(previewModal);
});

enableValidation(settings);
