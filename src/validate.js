import * as yup from "yup";

export default (link, feeds) => {
  const allFeeds = feeds.map(({ feed }) => feed);
  const schema = yup.string().url().notOneOf(allFeeds);

  return schema.validate(link);
};
