const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const uploadMediaToMeta = async ({ filePath, mimeType, phoneNumberId, accessToken }) => {
    try {
        const formData = new FormData();

        formData.append("file", fs.createReadStream(filePath));
        formData.append("type", mimeType);
        formData.append("messaging_product", "whatsapp");

        const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${phoneNumberId}/media`;
        // const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${process.env.META_WABA_ID}/media`;

        const response = await axios.post(url, formData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                ...formData.getHeaders()
            }
        });

        if (!response.data?.id) {
            throw new Error("Media upload failed: no media id returned");
        }

        return response.data.id;

    } catch (error) {
        console.error("Meta media upload failed:", error?.response?.data || error.message);
        throw new Error("Meta media upload failed");
    }
}

module.exports = uploadMediaToMeta;
