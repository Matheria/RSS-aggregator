import onChange from "on-change";

const createCard = (title) => {
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("card", "border-0");

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  const cardTitle = document.createElement("h2");
  cardTitle.classList.add("card-title", "h4");
  cardTitle.textContent = title;

  const cardList = document.createElement("ul");
  cardList.classList.add("list-group", "border-0", "rounded-0");

  cardBody.append(cardTitle);
  cardContainer.append(cardBody, cardList);

  return card;
};

const createFeed = (feed) => {
  const { title, description } = feed;

  const feedItem = document.createElement("li");
  feedItem.classList.add("list-group-item", "border-0", "border-end-0");

  const feedTitle = document.createElement("h3");
  feedTitle.classList.add("h6", "m-0");
  feedTitle.textContent = title;

  const feedDescription = document.createElement("p");
  feedDescription.classList.add("m-0", "small", "text-black-50");
  feedDescription.textContent = description;

  feedItem.append(feedTitle, feedDescription);

  return feedItem;
};

const createPost = (post, text) => {
  const { title, link, id } = post;

  const postItem = document.createElement("li");
  postItem.classList.add(
    "list-group-item",
    "d-flex",
    "justify-content-between",
    "align-items-start",
    "border-0",
    "border-end-0"
  );

  const postLink = document.createElement("a");
  postLink.classList.add("fw-bold");
  postLink.setAttribute("href", `${link}`);
  postLink.setAttribute("target", "_blank");
  postLink.setAttribute("rel", "noopener noreferrer");
  postLink.dataset.id = `a_${id}`;
  postLink.textContent = title;

  const postBtn = document.createElement("button");
  postBtn.setAttribute("type", "button");
  postBtn.classList.add("btn", "btn-outline-primary", "btn-sm");
  postBtn.dataset.id = `btn_${id}`;
  postBtn.dataset.bsToggle = "modal";
  postBtn.dataset.bsTarget = "#modal";
  postBtn.textContent = text;

  postItem.prepend(postLink, postBtn);

  return postItem;
};

const renderData = (state, elements, i18nextInstance) => {
  const { feeds, posts } = elements;

  feeds.innerHTML = "";
  posts.innerHTML = "";

  const feedsContainer = createCard(i18nextInstance.t("feeds"));
  feeds.prepend(feedsContainer);

  const feedsList = feeds.querySelector("ul");
  state.feeds.forEach((feed) => {
    const newFeed = createFeed(feed);
    feedsList.prepend(newFeed);
  });

  const postsContainer = createCard(i18nextInstance.t("posts"));
  posts.prepend(postsContainer);

  const postsList = posts.querySelector("ul");
  state.posts.forEach((post) => {
    const newPost = createPost(post, i18nextInstance.t("buttons.view"));
    postsList.append(newPost);
  });
};

export default (state, elements, i18nextInstance) =>
  onChange(state, (path, value) => {
    const { form, input, submit, feedback } = elements;

    switch (path) {
      case "posts":
        renderData(state, elements, i18nextInstance);
        break;
      case "processState":
        switch (value) {
          case "filling":
            submit.disabled = true;
            input.removeAttribute("readonly");
            input.focus();
            feedback.classList.remove("text-success");
            feedback.classList.remove("text-danger");
            feedback.textContent = i18nextInstance.t("loading");
            break;
          case "recieved":
            input.removeAttribute("readonly");
            input.classList.remove("is-invalid");
            feedback.classList.remove("text-danger");
            feedback.classList.add("text-success");
            feedback.textContent = i18nextInstance.t("success");
            form.reset();
            input.focus();
            renderData(state, elements, i18nextInstance);
            break;
          case "failed":
            submit.disabled = false;
            input.removeAttribute("readonly");
            input.classList.add("is-invalid");
            feedback.classList.remove("text-sucess");
            feedback.classList.add("text-danger");
            feedback.textContent = i18nextInstance.t(`errors.${state.error}`);
            break;
          default:
            throw new Error(`Unknown state process: ${value}`);
        }
      default:
        throw new Error(`Unknown path: ${value}`);
    }
  });
