export const protect = async (req, res, next) => {
  try {
    const { userId } = await req.auth();
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" }); // ✅ stops here
    }
    return next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: err.code || err.message });
  }
};
