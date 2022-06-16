const axios = require('axios');
const config = require('./config');
const logger = require('./logger');

module.exports = async function sendMessage(chatId, text, parseMode) {
  try {
    const params = {
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }

    if (parseMode) {
      params.parse_mode = parseMode;
    }

    await axios.post(`https://api.telegram.org/bot${config.bot_token}/sendMessage`, params);
  } catch (err) {
    logger.error(err);
  }
}
