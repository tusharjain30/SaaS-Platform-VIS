const RESPONSE_CODES = require("../config/responseCode");

const parseJSONFields = (req, res, next) => {
    try {
        // Only parse if form-data
        if (req.headers["content-type"]?.includes("multipart/form-data")) {

            if (req.body.header) {
                req.body.header = JSON.parse(req.body.header);
            }

            if (req.body.footer) {
                req.body.footer = JSON.parse(req.body.footer);
            }

            if (req.body.buttons) {
                req.body.buttons = JSON.parse(req.body.buttons);
            }

            if (req.body.location) {
                req.body.location = JSON.parse(req.body.location);
            }
        }
        next();
    } catch (err) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            message: "Invalid JSON format in form-data fields",
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            data: {}
        });
    }
};

module.exports = parseJSONFields;