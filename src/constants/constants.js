const { RESTJSONErrorCodes: {
  MissingAccess,
  MissingPermissions,
  UnknownChannel,
  UnknownInteraction,
  UnknownMessage
}} = require("discord-api-types/rest/v10");

module.exports = {
  IGNORE_ERRORS: {
    SEND: [ MissingPermissions, UnknownChannel ],
    UPDATE: [ UnknownMessage, UnknownInteraction, MissingPermissions, MissingAccess ],
    EDIT: [ UnknownMessage, UnknownInteraction, MissingPermissions, MissingAccess ],
  }
};