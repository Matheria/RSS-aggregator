import axios from "axios";
import i18next from "i18next";
import onChange from "on-change";
import _ from "lodash";
import * as yup from "yup";

import parser from "./parser.js";
import render from "./view.js";
import ru from "./locales/ru";

const validator = (currentUrl, urls) => {
  const schema = yup.string().url().notOneOf(urls);

  return schema.validate(currentUrl);
};

export default () => {
  const defaultLanguage = "ru";

  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      lng: defaultLanguage,
      debug: false,
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
          notOneOf: "rssAlreadyExist",
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
      url: "",
      links: [],
      feeds: [
        /*{ url: "https://ru.hexlet.io/lessons.rss", id: "1" }*/
      ],
    },
    render
  );

  const rssForm = document.querySelector(".rss-form");

  rssForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    state.url = data.get("url");

    validator(state.url, state.links)
      .then(() => {
        state.form.valid = true;
        state.form.state = "processed";
        return axios.get(
          `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
            state.url
          )}`
        );
      })
      .then(({ data }) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  });
};
