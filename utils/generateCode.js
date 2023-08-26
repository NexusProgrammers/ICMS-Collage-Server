const generateCode = () => {
  const code = Math.floor(10000 + Math.random() * 90000);

  const expirationTime = Date.now() + 5 * 60 * 1000;

  return {
    code,
    expiresAt: expirationTime,
  };
};

export default generateCode;

