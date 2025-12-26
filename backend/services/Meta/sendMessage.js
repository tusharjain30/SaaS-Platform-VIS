const axios = require("axios");

const sendWhatsAppMessage = async ({
    to,
    payload
}) => {
    const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`;

    try {
        const response = await axios.post(
            url,
            {
                messaging_product: "whatsapp",
                to,
                ...payload
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;
    } catch (error) {
        console.log(
            "WhatsApp Send Error:",
            error?.response?.data || error.message
        );
        throw error;
    }
};

module.exports = sendWhatsAppMessage;
