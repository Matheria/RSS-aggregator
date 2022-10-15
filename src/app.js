//import axios from "axios";
import i18next from "i18next";
import onChange from "on-change";
import _ from "lodash";
import * as yup from "yup";
import validate from "./validate.js";
import render from "./view.js";
import ru from "./locales/ru";

export default () => {
  const defaultLanguage = "ru";

  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      lng: defaultLanguage,
      debug: true,
      resources: {
        ru,
      },
    })
    .then(() => {
      yup.setLocale({
        string: {
          url: "invalidURL",
        },
        mixed: {
          notOneOf: "rssExist",
        },
      });
    });

  const state = onChange(
    {
      form: {
        valid: true,
        state: "filling", //processed, failed
        errors: null,
      },
      feeds: [{ url: "https://ru.hexlet.io/lessons.rss", id: "1" }],
    },
    render
  );

  const rssForm = document.querySelector(".rss-form");
  rssForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const link = data.get("url");
    const errors = validate(link, state.feeds);

    if (!errors) {
      state.feeds.unshift({ url: link, id: _.uniqueId() });
      state.form.valid = true;
      rssForm.reset();
    } else {
      state.form.valid = false;
      state.form.errors = errors;
      rssForm.reset();
    }
  });
};
