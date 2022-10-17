export default (data) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, "application/xml");

  return parsedData;
};
