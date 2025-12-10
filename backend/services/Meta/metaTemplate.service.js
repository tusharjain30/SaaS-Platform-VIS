const axios = require("axios");

const submitTemplateToMeta = async (template) => {
    const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${process.env.META_WABA_ID}/message_templates`;

    const payload = {
        name: template.name,
        language: template.language,
        category: template.category,
        components: [
            {
                type: "BODY",
                text: template.body
            }
        ]
    };

    const response = await axios.post(url, payload, {
        headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        }
    });

    return response.data;
};

module.exports = submitTemplateToMeta;