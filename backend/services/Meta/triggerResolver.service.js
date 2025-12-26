module.exports = ({ text, buttonPayload, listPayload }) => {
  return [
    buttonPayload && { triggerType: "BUTTON", triggerValue: buttonPayload },
    listPayload && { triggerType: "BUTTON", triggerValue: listPayload },
    text && { triggerType: "KEYWORD", triggerValue: { contains: text } },
    { triggerType: "DEFAULT" }
  ].filter(Boolean);
};
