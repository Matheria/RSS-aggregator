export default (response) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(response.data.contents, 'text/xml');
  const parserError = parsedData.querySelector('parsererror');

  if (parserError) {
    const error = new Error();
    error.isParserError = true;
    throw error;
  }

  const title = parsedData.querySelector('title').textContent;
  const description = parsedData.querySelector('description').textContent;

  const feed = {
    title,
    description,
  };

  const posts = [...parsedData.querySelectorAll('item')].map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postDescription = post.querySelector('description').textContent;
    const postLink = post.querySelector('link').textContent;
    return {
      title: postTitle,
      description: postDescription,
      link: postLink,
    };
  });

  return { feed, posts };
};
