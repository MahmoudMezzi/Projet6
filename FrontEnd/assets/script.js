function updateLoginLogoutLink() {
  const loginLogoutLink = document.getElementById("logout-button");

  if (localStorage.getItem("token")) {
    loginLogoutLink.textContent = "logout";
    loginLogoutLink.href = "#";
    loginLogoutLink.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "./login-page.html";
    });
  } else {
    loginLogoutLink.textContent = "login";
    loginLogoutLink.href = "./login-page.html";
    loginLogoutLink.removeEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "./login-page.html";
    });
  }
}

updateLoginLogoutLink();

const modifyBtn = document.getElementById("modify-btn");
const token = localStorage.getItem("token");

if (token) {
  modifyBtn.style.display = "block";
} else {
  modifyBtn.style.display = "none";
}

modifyBtn.addEventListener("click", () => {
  openModal("modal1");
  displayModalWorks();
});

/**************************************** */
async function fetchData() {
  const response = await fetch("http://localhost:5678/api/works");
  const data = await response.json();
  displayWorks(data, ".gallery");

  return data;
}

/************************************************* */
async function deleteWork(workId) {
  const url = `http://localhost:5678/api/works/${workId}`;

  try {
    const confirmed = confirm(
      "Êtes-vous sûr(e) de vouloir supprimer cette image ?"
    );

    if (!confirmed) {
      return; // annulation de suppression !
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("La suppression de l'image a échoué");
    }

    // Mise à jour de l'affichage après la suppression
    fetchData().then((data) => {
      categoryNamesToIds = createFilterButtons(data);
      displayWorks(data, ".gallery");
    });

  } catch (error) {
    console.error("Erreur:", error);
  }
}



/**************************************************** */
function displayWorks(data, targetElement, modalModif = false) {
  const gallery = document.querySelector(targetElement);
  gallery.innerHTML = "";
  data.forEach((work) => {
    const figure = document.createElement("figure");
    figure.style.position = "relative";

    if (work.imageUrl) {
      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;
      figure.appendChild(img);
    }

    if (modalModif) {
      const trashBin = document.createElement("span");
      trashBin.classList.add("trash-bin");
      trashBin.innerHTML = "&#128465;";
      trashBin.addEventListener("click", async (event) => {
        event.stopPropagation();
        await deleteWork(work.id);
        figure.remove();
      });
      figure.appendChild(trashBin);
    }

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = modalModif ? "éditer" : work.title;
    figcaption.setAttribute("data-category-id", work.category.id);
    figcaption.setAttribute("data-work-id", work.id);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

/********************************************************** */
function createFilterButtons(data) {
  const btnSection = document.querySelector("#btn-section");
  btnSection.innerHTML = "";
  const categoriesMap = new Map([[0, "All"]]);

  data.forEach((work) => {
    categoriesMap.set(work.category.id, work.category.name);
  });

  const categoryNamesToIds = {};

  const categorySelect = document.getElementById("category");

  // Ajoutez cette ligne pour vider le menu déroulant avant de le remplir à nouveau
  categorySelect.innerHTML = "";

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "";
  categorySelect.appendChild(emptyOption);

  categoriesMap.forEach((categoryName, categoryId) => {
    const btn = document.createElement("button");
    btn.classList.add("btn-filter");
    btn.textContent = categoryName;
    btn.addEventListener("click", () => {
      filterWorksByCategory(categoryId);
    });
    btnSection.appendChild(btn);

    categoryNamesToIds[categoryName] = categoryId;

    if (categoryId !== 0) {
      const option = document.createElement("option");
      option.value = categoryName;
      option.textContent = categoryName;
      categorySelect.appendChild(option);
    }
  });
  return categoryNamesToIds;
}

let categoryNamesToIds = {};

fetchData().then((data) => {
  categoryNamesToIds = createFilterButtons(data);
  displayWorks(data, ".gallery");
});

/********************************************************* */
function filterWorksByCategory(categoryId) {
  const figures = document.querySelectorAll(".gallery figure");
  figures.forEach((figure) => {
    const workCategoryId = parseInt(
      figure.querySelector("figcaption").getAttribute("data-category-id"),
      10
    );

    if (categoryId === 0 || workCategoryId === categoryId) {
      figure.style.display = "block";
    } else {
      figure.style.display = "none";
    }
  });
}
/********************************************************* */
function displayModalWorks() {
  fetchData().then((data) => {
    console.log(data);
    displayWorks(data, "#modal1 .gallery", true);
  });
}

/******************************************************** */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "block";
}
/******************************************************** */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
}



/******************************************************** */
function setupModal() {
  // modale 1
  const modal1 = document.getElementById("modal1");
  const modifyBtn = document.getElementById("modify-btn");
  modifyBtn.addEventListener("click", () => {
    openModal("modal1");
    displayModalWorks();
  });

  const closeModalBtn1 = document.querySelector("#modal1 .close");
  closeModalBtn1.addEventListener("click", () => closeModal("modal1"));

  const btnAdd = document.querySelector("#modal1 .btn-add");
  btnAdd.addEventListener("click", () => {
    closeModal("modal1");
    openModal("modal2");
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal1) {
      closeModal("modal1");
    }
  });

  // modale 2
  const modal2 = document.getElementById("modal2");
  const closeModalBtn2 = document.querySelector("#modal2 .close");
  closeModalBtn2.addEventListener("click", () => closeModal("modal2"));

  const backBtn = document.querySelector("#modal2 .back-btn");
  backBtn.addEventListener("click", () => {
    closeModal("modal2");
    openModal("modal1");
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal2) {
      closeModal("modal2");
    }
  });
}


/************************************************************ */
const fileInput = document.getElementById("file");
const imageDisplay = document.querySelector(".image-display-change");

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    imageDisplay.innerHTML = `<img src="${e.target.result}" alt="Aperçu" />`;
  };
  reader.readAsDataURL(file);
});

async function addWork(title, categoryId, image) {
  const url = "http://localhost:5678/api/works";

  const formData = new FormData();
  formData.append("title", title);
  formData.append("category", categoryId);
  formData.append("image", image);
  console.log("addWork", title, image, categoryId);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error("L'ajout de l'image a échoué");
  }
  const data = await response.json();
  return data;
}
function resetForm() {
  // Réinitialiser les champs du formulaire
  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("category");
  const imageInput = document.getElementById("file");
  const imageDisplay = document.querySelector(".image-display-change");

  titleInput.value = "";
  categorySelect.value = "";
  imageInput.value = "";
  imageDisplay.innerHTML = "";
}
const validateBtn = document.querySelector("#modal2 .validate-btn");
validateBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("category");
  const imageInput = document.getElementById("file");

  const title = titleInput.value;
  const categoryName = categorySelect.value;
  const categoryId = categoryNamesToIds[categoryName];
  const image = imageInput.files[0];

  if (title && categoryId && image) {
    await addWork(title, categoryId, image);
    await fetchData(); // Met à jour les données
    closeModal("modal2"); // Ferme la modale 2
    openModal("modal1"); // Ouvre la modale 1
    displayModalWorks(); // Met à jour l'affichage des œuvres dans la modale 1
    resetForm(); // Réinitialiser les champs du formulaire
  } else {
    alert("Veuillez remplir tous les champs et sélectionner une image.");
  }
});





function checkIfAllFieldsAreFilled() {
  const titleInput = document.getElementById("title");
  const categoryInput = document.getElementById("category");
  const imageInput = document.getElementById("file");
  const validateBtn = document.querySelector("#modal2 .validate-btn");

  if (titleInput.value && categoryInput.value && imageInput.files.length > 0) {
    validateBtn.classList.add("valider-enabled");
  } else {
    validateBtn.classList.remove("valider-enabled");
  }
}

const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const imageInput = document.getElementById("file");

titleInput.addEventListener("input", checkIfAllFieldsAreFilled);
categoryInput.addEventListener("input", checkIfAllFieldsAreFilled);
imageInput.addEventListener("change", checkIfAllFieldsAreFilled);




fetchData();
setupModal();
