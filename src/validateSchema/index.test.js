// @flow
import validateSchema from './'

describe('validateSchema', function(){
  let friendsRelationship
  let schema
  beforeEach(()=>{
    friendsRelationship = {

    }
    schema = {
      users: {
        relationships: [
          friendsRelationship
        ]
      }
    }
  })
  it('fails without entityName', function(){
    expect(()=>validateSchema(schema)).toThrowError('users entitySchema is missing a relationship entityName for the relationship Undefined')
  })
  it('fails without type', function(){
    friendsRelationship.entityName = 'users'
    expect(()=>validateSchema(schema)).toThrowError('users entitySchema is missing a relationship type for the relationship users')
  })
  it('passes', function(){
    friendsRelationship.entityName = 'users'
    friendsRelationship.type = 1
    expect(validateSchema(schema)).toEqual('valid')
  })
})
