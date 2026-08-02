export const protect = async (req, res, next) => {
  try {
    console.log("Header:", req.headers.authorization);
    const auth = req.auth();
    console.log("Auth object:", auth);
    const { userId } = auth;
    if (!userId) return res.status(401).json({ message: "Not authorized" });
    return next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: err.code || err.message });
  }
};
