import { IsArray, IsEmail, IsIn } from 'class-validator'
import { Model } from '../lib/mixins'
import { Prop } from '../lib/decorators'

const LEVELS = <const>['admin', 'master']

type Level = typeof LEVELS[number]

export class Sample extends Model() {
  @Prop({
    name: 'Email',
    type: String,
    enums: [],
    args: [],
    conflits: [],
    required: false,
    validate: context => {
      return true
    },
    decorate: () => [
      {
        when: ['eq'],
        with: [IsEmail()],
      },
    ],
  })
  email: string

  @Prop({
    name: 'Level access',
    type: String,
    enums: LEVELS,
    args: [],
    conflits: [],
    required: false,
    validate: context => {
      return true
    },
    decorate: ({ enums }) => [
      {
        when: ['eq'],
        with: [IsIn(enums)],
      },
      {
        when: ['in'],
        with: [IsArray(), IsIn(enums, { each: true })],
      },
    ],
  })
  roles: Level | Level[]

  @Prop({
    name: 'Username',
    type: String,
    enums: [],
    args: [],
    conflits: ['email'],
    required: false,
    options: {
      message: 'expected a valid username',
    },
    validate: context => {
      return true
    },
    decorate: ({ enums }) => [
      {
        when: ['eq'],
        with: [IsIn(enums)],
      },
    ],
  })
  username: string
}
