import jwt from "jsonwebtoken";

export const verifyToken = (request, response, next) => {
  const token = request.cookies.jwt;

  if (!token) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_KEY, async (error, payload) => {
    if (error) {
      return response.status(403).json({ error: "Token is invalid" });
    }
    request.userId = payload.userId;
    next();
  });
};

export const checkAuth = (request, response, next) => {
  const token = request.cookies.jwt;

  if (!token) {
    // No token, proceed without setting userId
    return next();
  }

  jwt.verify(token, process.env.JWT_KEY, async (error, payload) => {
    if (error) {
      // If token is invalid, we can just treat it as no auth or return error.
      // Usually better to return error so client clears cookie.
      return response.status(403).json({ error: "Token is invalid" });
    }
    request.userId = payload.userId;
    next();
  });
};
