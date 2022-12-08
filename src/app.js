import axios from 'axios';
import i18n from 'i18next';
import _ from 'lodash';
import * as yup from 'yup';

import render from './view.js';
import parser from './parser.js';
import ru from './locales/ru';

const validator = (link, feeds) => {
  const urls = feeds.map(({ url }) => url);
  const schema = yup.string().url().notOneOf(urls);

  return schema.validate(link);
};

const handleErrors = (error, state) => {
  switch (true) {
    case error.isAxiosError:
      state.errors = 'networkError';
      break;
    case error.isParserError:
      state.errors = 'parseError';
      break;
    case error instanceof yup.ValidationError:
      state.errors = error.message;
      break;
    default:
      state.errors = 'unknownError';
      break;
  }
};

const getUrlProxy = (url) => {
  const proxifiedUrl = new URL('https://allorigins.hexlet.app/get');
  proxifiedUrl.searchParams.set('disableCache', 'true');
  proxifiedUrl.searchParams.set('url', url);

  return proxifiedUrl.toString();
};

const handleEvents = (view, state, elements) => {
  const { form, postsContainer } = elements;

  const handleForm = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    state.url = formData.get('url');
    view.processState = 'filling';

    validator(state.url, state.feeds)
      .then(() => axios.get(getUrlProxy(state.url)))
      .then((response) => {
        const data = parser(response);

        const viewFeed = {
          title: data.feed.title,
          description: data.feed.description,
          id: _.uniqueId('feed_'),
          url: state.url,
        };

        state.feedId = viewFeed.id;
        state.feeds.push(viewFeed);

        const handlePosts = (feedId, posts) => posts.map((post) => ({
          title: post.title,
          description: post.description,
          link: post.link,
          id: _.uniqueId('post_'),
          feedId,
        }));

        const viewPost = handlePosts(state.feedId, data.posts);

        state.posts = [...viewPost, ...state.posts];
        view.processState = 'received';
      })
      .catch((error) => {
        handleErrors(error, state);
        view.processState = 'failed';
      });
  };

  const handleVisitedPosts = (e) => {
    const currentId = e.target.dataset.id;

    const getPostId = (prefix, targetId) => {
      const postId = targetId.substring(prefix.length, targetId.length);
      return state.posts.find(({ id }) => id === postId);
    };

    const btnIdPrefix = 'btn_';
    const aIdPrefix = 'a_';

    if (currentId && currentId.match(/btn_post_\d+$/)) {
      const currentPost = getPostId(btnIdPrefix, currentId);
      view.visitedPosts.add(currentPost);
      view.previewPost = currentPost;
    }

    if (currentId && currentId.match(/a_post_\d+$/)) {
      const currentPost = getPostId(aIdPrefix, currentId);
      view.visitedPosts.add(currentPost);
    }
  };

  form.addEventListener('submit', handleForm);
  postsContainer.addEventListener('click', handleVisitedPosts);
};

const updateRssFeed = (view, state) => {
  const updateInterval = 5000;
  const promises = state.feeds.map((feed) => axios.get(getUrlProxy(feed.url))
    .then((response) => {
      const parsedData = parser(response);
      const diff = _.differenceBy(parsedData.posts, state.posts, 'link');
      if (diff) {
        const handlePosts = (feedId, posts) => posts.map((post) => ({
          title: post.title,
          description: post.description,
          link: post.link,
          id: _.uniqueId('post_'),
          feedId,
        }));
        const newPosts = handlePosts(feed.id, diff);
        view.posts = [...newPosts, ...state.posts];
      }
    }));
  Promise.all(promises)
    .catch((err) => {
      throw new Error(err.message);
    })
    .finally(() => setTimeout(() => updateRssFeed(view, state), updateInterval));
};

export default () => {
  const defaultLanguage = 'ru';

  const i18nextInstance = i18n.createInstance();
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
          url: 'invalidURL',
        },
        mixed: {
          notOneOf: 'rssAlreadyExist',
        },
      });
    });

  const state = {
    processState: '', // filling, received, failed
    errors: null,
    url: '',
    feeds: [],
    feedId: 0,
    posts: [],
    previewPost: '',
    visitedPosts: new Set(),
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    submit: document.querySelector("[type='submit']"),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),

    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.full-article'),
  };

  const view = render(state, elements, i18nextInstance);

  handleEvents(view, state, elements);
  updateRssFeed(view, state);
};
