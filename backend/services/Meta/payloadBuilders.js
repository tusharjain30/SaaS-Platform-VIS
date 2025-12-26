const buildTextPayload = (text) => ({
  type: "text",
  text: {
    body: text
  }
});

const buildMediaPayload = ({ mediaType, mediaId, caption }) => ({
  type: mediaType.toLowerCase(),
  [mediaType.toLowerCase()]: {
    id: mediaId,
    caption: caption || undefined
  }
});

const buildButtonPayload = ({ bodyText, buttons }) => ({
  type: "interactive",
  interactive: {
    type: "button",
    body: { text: bodyText },
    action: {
      buttons: buttons.map(btn => ({
        type: "reply",
        reply: {
          id: btn.payload,
          title: btn.label
        }
      }))
    }
  }
});

const buildListPayload = ({ bodyText, buttonLabel, sections }) => ({
  type: "interactive",
  interactive: {
    type: "list",
    body: { text: bodyText },
    action: {
      button: buttonLabel,
      sections: sections.map(sec => ({
        title: sec.title,
        rows: sec.rows.map(row => ({
          id: row.rowId,
          title: row.title,
          description: row.description || ""
        }))
      }))
    }
  }
});

const buildCtaPayload = ({ bodyText, text, url }) => ({
  type: "interactive",
  interactive: {
    type: "button",
    body: { text: bodyText },
    action: {
      buttons: [
        {
          type: "url",
          url: {
            link: url,
            text
          }
        }
      ]
    }
  }
});

module.exports = {
    buildTextPayload,
    buildMediaPayload,
    buildButtonPayload,
    buildListPayload,
    buildCtaPayload
}