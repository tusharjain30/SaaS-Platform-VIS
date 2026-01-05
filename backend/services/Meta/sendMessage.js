const axios = require("axios");

const sendWhatsAppMessage = async ({
    phoneNumberId,
    accessToken,
    to,
    payload
}) => {
    const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${phoneNumberId}/messages`;

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
        console.log(response);
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
