const jwt = require("jsonwebtoken");
const { PrismaClient } = require("../generated/prisma/client");
const RESPONSE_CODES = require("../config/responseCode");
const prisma = new PrismaClient();

const userAuth = async (req, res, next) => {
    try {

        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).json({
                status: 0,
                message: "No token provided",
                statusCode: RESPONSE_CODES.UNAUTHORIZED,
                data: {}
            });
        }

        const decoded = jwt.verify(token, process.env.USER_JWT_SECRET);
        const { userId, tokenVersion } = decoded;

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
                wabaVerification: true
            }
        });

        if (!user) {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).json({
                status: 0,
                message: "User not found",
                statusCode: RESPONSE_CODES.UNAUTHORIZED,
                data: {}
            })
        }

        if (user.isDeleted || !user.isActive) {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).json({
                status: 0,
                message: "Account inactive/deleted",
                statusCode: RESPONSE_CODES.UNAUTHORIZED,
                data: {}
            });
        }

        // Compare tokenVersion
        if (tokenVersion !== user.tokenVersion) {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).json({
                status: 0,
                message: "Session expired. Please login again.",
                statusCode: RESPONSE_CODES.UNAUTHORIZED,
                data: {}
            });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            wabaVerification: user.wabaVerification
        };

        next();

    } catch (error) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).json({
            status: 0,
            message: "Invalid or expired token",
            statusCode: RESPONSE_CODES.UNAUTHORIZED,
            data: {}
        });
    }
};

module.exports = userAuth;