const RESPONSE_CODES = require("../../../../config/responseCode");

module.exports = (req, res) => {
    try {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];  // Checks whether the token is equal or not
        const challenge = req.query['hub.challenge']; // Meta gives a random number
        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {  // Confirms there is a subscription request
            console.log('VERIFIED! returning challenge:', challenge);
            return res.status(200).send(challenge);   // return the same number back
        }

        console.log('VERIFY FAILED');
        res.sendStatus(403);

    } catch (error) {
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: error.message,
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        })
    };
};