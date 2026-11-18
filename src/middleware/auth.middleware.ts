import { Request, Response, NextFunction } from "express";
import { jwtVerify, createRemoteJWKSet } from "jose";

const authURL =
  process.env.BETTER_AUTH_URL || "http://localhost:3000";

const JWKS = createRemoteJWKSet(
  new URL(`${authURL}/api/auth/jwks`)
);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "customer" | "technician" | "admin";
  };
}

// Verify JWT Token
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const token = authHeader.split(" ")[1];

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: authURL,
      audience: authURL,
    });

    const role = payload.role;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      !["customer", "technician", "admin"].includes(
        role as string
      )
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid user information.",
      });
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: role as "customer" | "technician" | "admin",
    };

    next();
  } catch (error) {
    console.error("JWT Verification Failed:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Role Authorization
export const authorizeRoles = (
  ...roles: ("customer" | "technician" | "admin")[]
) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission.",
      });
    }

    next();
  };
};