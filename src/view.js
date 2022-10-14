export default (path, value) => {
  const formInput = document.querySelector("#url-input");
  const feedback = document.querySelector(".feedback");

  if (path === "form.valid") {
    switch (value) {
      case true:
        formInput.classList.remove("is-invalid");
        feedback.classList.remove("text-danger");
        feedback.textContent = "Sucess";
        break;
      case false:
        formInput.classList.add("is-invalid");
        feedback.classList.add("text-danger");
        feedback.textContent = "Введён невалидный URL";
        break;
      default:
        throw new Error(`Unexpected value: ${value}`);
    }
  }
};
