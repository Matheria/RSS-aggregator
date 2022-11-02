import axios from "axios";
import i18n from "i18next";
import _, { uniqueId } from "lodash";
import * as yup from "yup";

import render from "./view.js";
import parser from "./parser.js";
import ru from "./locales/ru";

const validator = (link, feeds) => {
  const urls = feeds.map(({ url }) => url);
  const schema = yup.string().url().notOneOf(urls);

  return schema.validate(link);
};

const handleErrors = (err, state) => {
  switch (true) {
    case err.isAxiosError:
      state.error = "networkError";
      break;
    case err.isParserError:
      state.error = "parserError";
      break;
    case err instanceof yup.ValidationError:
      state.error = err.message;
      break;
    default:
      state.error = "unknownError";
  }
};

const getUrlProxy = (url) => {
  const proxifiedUrl = new URL("https://allorigins.hexlet.app/get");
  proxifiedUrl.searchParams.set("disableCache", "true");
  proxifiedUrl.searchParams.set("url", url);

  return proxifiedUrl;
};

export default () => {
  const i18nextInstance = i18n.createInstance();
  i18nextInstance
    .init({
      lng: "ru",
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

  const state = {
    processState: "", //filling, recieved, failed
    error: null,
    url: "",
    feeds: [],
    feedId: 0,
    posts: [],
    postId: uniqueId(),
  };

  const elements = {
    form: document.querySelector(".rss-form"),
    input: document.querySelector("#url-input"),
    submit: document.querySelector("[type='submit']"),
    feedback: document.querySelector(".feedback"),
    feeds: document.querySelector(".feeds"),
    posts: document.querySelector(".posts"),
  };

  const handleForm = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    state.url = formData.get("url");
    state.processState = "filling";

    validator(state.url, state.feeds)
      .then(() => axios.get(getUrlProxy(state.url)))
      .then((response) => {
        const { feed, posts } = parser(response);

        const viewFeed = {
          title: feed.title,
          description: feed.description,
          id: _.uniqueId("feed_"),
          url: state.url,
        };
        state.feedId = viewFeed.id;
        state.feeds.push(viewFeed);

        const handlePosts = (feedId, posts) => {
          return posts.map((post) => ({
            title: post.title,
            description: post.description,
            link: post.link,
            id: _.uniqueId("post_"),
            feedId,
          }));
        };
        const viewPost = handlePosts(state.feedId, posts);

        state.posts = [...viewPost, ...state.posts];
      })
      .catch((err) => {
        handleErrors(err, state);
        state.processState = "failed";
      });
  };

  elements.form.addEventListener("submit", handleForm);

  render(state, elements, i18nextInstance);

  // rssForm.addEventListener("submit", (e) => {
  //   e.preventDefault();

  //   const formInput = document.querySelector("#url-input");
  //   const feedback = document.querySelector(".feedback");

  //   const feeds = document.querySelector(".feeds");
  //   const posts = document.querySelector(".posts");

  //   const data = new FormData(e.target);
  //   state.url = data.get("url");

  //   validator(state.url, state.links)
  //     .then(() => {
  //       state.valid = true;
  //       state.processState = "sending";

  //       formInput.classList.remove("is-invalid");
  //       feedback.classList.remove("text-danger");
  //       feedback.classList.add("text-success");
  //       feedback.textContent = "RSS успешно загружен";

  //       return axios.get(
  //         `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
  //           state.url
  //         )}`
  //       );
  //     })
  //     .then(({ data }) => {
  //       const parsedData = parser(data.contents);
  //       const parseError = parsedData.querySelector("parsererror");
  //       if (parseError) throw new Error("Parsing error");
  //       const normalizedData = normalizeData(parsedData);

  //       state.error = "";
  //       state.links.push(state.url);
  //       state.processState = "filling";
  //       state.feeds.push(normalizedData.feed);
  //       state.posts.push(normalizedData.posts);

  //       console.log(normalizedData);

  //       //--------------------------------------------------------------------------
  //       const feedsContainer = document.createElement("div");
  //       feedsContainer.classList.add("card", "border-0");

  //       const feedTitleContainer = document.createElement("div");
  //       feedTitleContainer.classList.add("card-body");

  //       const feedTitle = document.createElement("h2");
  //       feedTitle.classList.add("card-title", "h4");
  //       feedTitle.textContent = "Фиды";

  //       const feedsList = document.createElement("ul");
  //       feedsList.classList.add("list-group", "border-0", "rounded-0");

  //       const feedItem = document.createElement("li");
  //       feedItem.classList.add("list-group-item", "border-0", "border-end-0");

  //       const { post } = state.posts;
  //       console.log(post);

  //       state.feeds.forEach((item) => {
  //         const itemTitle = document.createElement("h3");
  //         itemTitle.classList.add("h6", "m-0");

  //         const itemDesc = document.createElement("p");
  //         itemDesc.classList.add("m-0", "small", "text-black-50");

  //         itemTitle.textContent = item.title;
  //         itemDesc.textContent = item.description;
  //         feedItem.append(itemTitle);
  //         feedItem.append(itemDesc);

  //         return feedItem;
  //       });

  //       feedTitleContainer.append(feedTitle);
  //       feedsList.append(feedItem);
  //       feedsContainer.append(feedTitleContainer, feedsList);
  //       feeds.append(feedsContainer);
  //       //--------------------------------------------------------------

  //       const postsContainer = document.createElement("div");
  //       postsContainer.classList.add("card", "border-0");

  //       const postTitleContainer = document.createElement("div");
  //       postTitleContainer.classList.add("card-body");

  //       const postTitle = document.createElement("h2");
  //       postTitle.classList.add("card-title", "h4");
  //       postTitle.textContent = "Посты";

  //       const postsList = document.createElement("ul");
  //       postsList.classList.add("list-group", "border-0", "rounded-0");

  //       const postItem = document.createElement("li");
  //       postItem.classList.add(
  //         "list-group-item",
  //         "d-flex",
  //         "justify-content-between",
  //         "align-items-start",
  //         "border-0",
  //         "border-end-0"
  //       );

  //       const a = document.createElement("a");
  //       a.setAttribute("href", `${state.links}`);
  //       a.classList.add("fw-bold");
  //       a.dataset.id = `a_${state.postId}`;
  //       a.setAttribute("target", "_blank");
  //       a.setAttribute("rel", "noopener noreferrer");

  //       const button = document.createElement("button");
  //       button.setAttribute("type", "button");
  //       button.classList.add("btn", "btn-outline-primary", "btn-sm");
  //       button.dataset.id = `btn_${state.postId}`;
  //       button.dataset.bsToggle = "modal";
  //       button.dataset.bsTarget = "#modal";
  //       button.textContent = "Посмотреть";

  //       state.posts.map((item) => {});

  //       postTitleContainer.append(feedTitle);
  //       postsList.append(postItem);
  //       postItem.prepend(a, button);
  //       postsContainer.append(postTitleContainer, postsList);
  //       posts.append(postsContainer);
  //     })
  //     .catch((err) => {
  //       switch (err) {
  //         case err.isAxiosError:
  //           state.error = "networkError";
  //           break;
  //         case err.isParseError:
  //           state.error = "parseError";
  //           break;
  //         case err instanceof yup.ValidationError:
  //           state.error = err.message;
  //           break;
  //         default:
  //           state.error = "unknownError";
  //       }

  //       state.valid = false;
  //       state.processState = "failed";

  //       formInput.classList.add("is-invalid");
  //       feedback.classList.add("text-danger");
  //       feedback.textContent = "Введён невалидный URL";
  //       console.log(state);
  //       console.log(err.message); // добавить обработчик ошибок
  //     });
  // });
};
