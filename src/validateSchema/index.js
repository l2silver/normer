// @flow
import type { $schema } from '../../types'

export default function validateSchema(schema: $schema){
  if (typeof schema !== 'object'){
    throw new TypeError('schema must be an object')
  }
  Object.keys(schema).forEach(key => {
    const entitySchema = schema[key];
    if (entitySchema.relationships) {
      entitySchema.relationships.forEach((relationship)=>{
        if (!relationship.entityName) {
          throw new TypeError(`${key} entitySchema is missing a relationship entityName for the relationship ${relationship.alias || relationship.name || 'Undefined'}`)
        }
        if (!relationship.type) {
          throw new TypeError(`${key} entitySchema is missing a relationship type for the relationship ${relationship.alias || relationship.name || relationship.entityName}`)
        }
      })
    }
  })
  return 'valid'
}