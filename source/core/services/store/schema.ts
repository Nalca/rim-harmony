import { JSONSchema } from 'json-schema-typed';

/** Le schéma de la base de données interne utilisée pour de façon persistante les données de l'application.  */
export const schema = {
  config: ({
    type: 'object',
    properties: {
      PATH_SEQUENCE_TO_IGNORE: {
        type: "array",
        items: {
          type: 'string'
        }
      },
      PATH_SEQUENCE_TO_INCLUDE: {
        type: "array",
        items: {
          type: 'string'
        }
      },
      PATH_TO_CHECK: {
        type: "array",
        items: {
          type: 'string',
        }
      },
      HARMONY_NAME: {
        type: "string",
      },
      HARMONY_VERSION: {
        type: "string",
      },
      MODLIST_PATH: {
        type: "string",
      }
    }
  }) as JSONSchema,
};
export default schema;