// @flow
import type { $schema, $entitySchema } from '../../types'
import relationshipTypes from '../relationshipTypes';

type $$id = string | number;
type $$mapOf<X> = {[key: string]: X};
type $$idMapOf<X> = {[key: string | number]: X};

type $entities = $$mapOf<{id: $$id}[]>
type $relationships = $$mapOf<$$mapOf<{id: $$id, value: $$id | $$id[]}[]>>

type $normalizeResponse = {
  entities: $entities,
  relationships: $relationships,
};

export default function normalize(
  input: Object,
  entityName: string,
  schema: $schema,
  startingSchema?: $entitySchema
) : $normalizeResponse {
  const entities = {}
  const relationships = {}
  _normalizeRecursive(input, entityName, schema, entities, relationships, startingSchema)
  return {entities, relationships}
}

const noopModifier = (ent)=>ent;

const defaultIdFunc = (ent)=>ent.id

const _normalizeRecursive = function (preinput: Object, entityName: string, schema: $schema, entities: $entities, relationshipData: $relationships, startingSchema?: $entitySchema) {
  const entitySchema = (startingSchema || schema[entityName])
  if (!entitySchema){
    throw Error(`schema ${entityName} not defined`)
  }
  const {premodifier = noopModifier, modifier = noopModifier, relationships = [], idFunc = defaultIdFunc} = entitySchema
  const input = premodifier(preinput);
  const inputId = idFunc(input)
  const finalEntityName = entitySchema.nameFunc ? entitySchema.nameFunc(preinput) : entityName
  _addToEntities(entities, finalEntityName, input, modifier, inputId)
  relationships.forEach(relationshipSchema => {
    const {name = relationshipSchema.entityName} = relationshipSchema
    const {alias = name} = relationshipSchema
    const relation = input[alias]
    if (relation) {
      const { idFunc: relationshipIdFunc = defaultIdFunc } = schema[relationshipSchema.entityName];
      if (relationshipSchema.type === relationshipTypes.MANY) {
        let relationshipIds = []
        relation.forEach(relatedEntity => {
          if (typeof relatedEntity !== 'object') {
            relationshipIds.push(relatedEntity)
          }
          else {
            _normalizeRecursive(relatedEntity, relationshipSchema.entityName, schema, entities, relationshipData)
            relationshipIds.push(relationshipIdFunc(relatedEntity))
          }
        })
        _addToRelationships(relationshipData, finalEntityName, name, inputId, relationshipIds)
      }
      else if (relationshipSchema.type === relationshipTypes.ONE){
        let relationshipId
        if (typeof relation !== 'object') {
          relationshipId = relation
        }
        else {
          relationshipId = relationshipIdFunc(relation)
          _normalizeRecursive(relation, relationshipSchema.entityName, schema, entities, relationshipData)
        }
        _addToRelationships(relationshipData, finalEntityName, name, inputId, relationshipId)
      }
    }
  })
}

const _addToRelationships = function (relationships, entityName, name, entityId, value) {
  if (!relationships[entityName]) {
    relationships[entityName] = {}
  }
  if (!relationships[entityName][name]) {
    relationships[entityName][name] = [];
  }
  relationships[entityName][name].push({
    id: entityId,
    value
  })
}

const _addToEntities = function (entities, entityName, entity, modifier, id) {
  if (!entities[entityName]) {
    entities[entityName] = []
  }
  entities[entityName].push(modifier({ ...entity, id}));
}
