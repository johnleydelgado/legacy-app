const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function stringToBlob(input: string | null): Buffer | null {
  if (input === null) input = "";
  return Buffer.from(input, 'utf-8');
}


export {
  isValidJSON,
  stringToBlob
}
