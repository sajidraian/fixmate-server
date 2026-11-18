import { jwtVerify, createRemoteJWKSet } from "jose";
const authURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const JWKS = createRemoteJWKSet(new URL(`${authURL}/api/auth/jwks`));
// Verify JWT Token
export const authenticateUser = async (req, res, next) => {
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
        if (typeof payload.sub !== "string" ||
            typeof payload.email !== "string" ||
            !["customer", "technician", "admin"].includes(role)) {
            return res.status(401).json({
                success: false,
                message: "Invalid user information.",
            });
        }
        req.user = {
            id: payload.sub,
            email: payload.email,
            role: role,
        };
        next();
    }
    catch (error) {
        console.error("JWT Verification Failed:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};
// Role Authorization
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission.",
            });
        }
        next();
    };
};
