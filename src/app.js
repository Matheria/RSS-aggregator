import validate from "./validate.js";

const form = document.querySelector(".rss-form");

const state = {
  form: {
    state: "",
    errors: null,
  },
  url: "",
  feeds: [],
};

const formHandler = (e) => {
  e.preventDefault();

  const data = new FormData(e.target);
  state.url = data.get("url");

  validate(state.url, state.feeds)
    .then(() => console.log("sucess"))
    .catch((err) => console.log(err.message));
};

form.addEventListener("submit", formHandler);

export default formHandler;
