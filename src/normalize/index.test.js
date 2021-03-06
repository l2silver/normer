// @flow
import Chance from 'chance'
import normalize from './'
import relationshipTypes from '../relationshipTypes';

const chance = new Chance()
describe('normalize', function () {
  let input, schema, relationshipSchema, comment
  beforeEach(function () {
    comment = {
      id: chance.natural(),
      content: chance.sentence()
    }
    input = {
      id: 1,
      title: chance.word(),
      comments: [
        comment
      ]
    }
    
    schema = {
      pageUsers: {
        nameFunc: ()=>'pages',
        idFunc: ()=>'users',
        modifier: (user)=>({id: user.id}),
        relationships: [
          {
            entityName: 'articles',
            name: 'article',
            type: relationshipTypes.ONE
          }
        ]
      },
      articles: {
        relationships: [
          {
            entityName: 'comments',
            type: relationshipTypes.MANY,
          }
        ],
      },
      comments: {},
    };
  })
  it('entities', function (){
    const {entities} = normalize(input, 'articles', schema)
    expect(entities).toMatchObject({
      articles: [
        {
          id: input.id,
          title: input.title,
          comments: input.comments,
        }
      ],
    })
  })
  describe('MANY', function (){
    it('relatedEntityObject', function () {
      const {entities, relationships} = normalize(input, 'articles', schema)
      expect(entities).toMatchObject({
        comments: [
          comment
        ]
      })
      expect(relationships).toEqual({
        articles: {
          comments: [
            {id: input.id, value: [comment.id]}
          ]
        }
      })
    })
    it('example with nameFunc', function () {
      const {entities, relationships} = normalize({
        article: input
      }, 'pageUsers', schema)
      expect(entities).toMatchObject({
        comments: [
          comment
        ],
        pages: [
          {
            id: "users",
          },
        ],
      })
      expect(relationships).toEqual({
        articles: {
          comments: [{
            id: input.id,
            value: [comment.id]
          }]
        },
        pages: {
          article: [
            {
              id: 'users', value: input.id
            }
          ],
        },
      })
    })
    describe('ONE', function (){
      it('relatedEntityId', function () {
        const {entities, relationships} = normalize({article: 1}, 'pageUsers', schema)
        expect(relationships).toEqual({
          pages: {
            article: [
              {id: 'users', value: 1}
            ]
          }
        })
      })
      it('relatedEntityObject', function () {
        const {entities, relationships} = normalize({article: {id: 1}}, 'pageUsers', schema)
        expect(entities).toMatchObject({
          articles: [
            {id: 1}
          ]
        })
        expect(relationships).toEqual({
          pages: {
            article: [
              {
                id: 'users',
                value: 1
              }
            ]
          }
        })
      })
    })
  })
})
