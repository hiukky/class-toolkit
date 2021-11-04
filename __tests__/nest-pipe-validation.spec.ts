import { IsEmail } from 'class-validator'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { Model, Prop } from '../index'

describe('NestJs ValidationPipe', () => {
  class DTO extends Model() {
    @Prop({
      type: Number,
    })
    id: number

    @Prop({
      type: String,
    })
    name: string

    @Prop({
      type: String,
      decorate: () => [
        {
          when: ['eq'],
          with: [IsEmail()],
        },
        {
          when: ['in', 'ni'],
          with: [IsEmail({}, { each: true })],
        },
      ],
    })
    email: string | string[]
  }

  const pipe = new ValidationPipe()

  describe('when it passes', () => {
    const payload = {
      id: { eq: 1 },
      name: { eq: 'Dev' },
      email: { eq: 'dev@email.com' },
    }

    const expected = {
      id: 1,
      name: 'Dev',
      email: 'dev@email.com',
    }

    it('body', async () => {
      const data = await pipe.transform(
        { ...payload },
        {
          type: 'body',
          metatype: DTO,
        },
      )

      expect(data).toStrictEqual(expected)
    })

    it('query', async () => {
      const data = await pipe.transform(
        { ...payload },
        {
          type: 'query',
          metatype: DTO,
        },
      )

      return expect(data).toEqual(expected)
    })

    it('param', async () => {
      const data = await pipe.transform(
        { ...payload },
        {
          type: 'param',
          metatype: DTO,
        },
      )

      return expect(data).toEqual(expected)
    })
  })

  describe('when fails', () => {
    const payload = {
      id: { ls: 1 },
      name: { df: 'Dev' },
      email: { df: 'dev@email.com' },
    }

    const messages = [
      'id: wait for one of the operators: eq',
      'name: wait for one of the operators: eq',
      'email: wait for one of the operators: eq,in,ni',
    ]

    it('body', async () => {
      try {
        await pipe.transform(
          { ...payload },
          {
            type: 'body',
            metatype: DTO,
          },
        )
      } catch (error: InstanceType<BadRequestException>) {
        expect(error.response.message).toEqual(messages)
      }
    })

    it('query', async () => {
      try {
        await pipe.transform(
          { ...payload },
          {
            type: 'query',
            metatype: DTO,
          },
        )
      } catch (error: InstanceType<BadRequestException>) {
        expect(error.response.message).toEqual(messages)
      }
    })

    it('param', async () => {
      try {
        await pipe.transform(
          { ...payload },
          {
            type: 'param',
            metatype: DTO,
          },
        )
      } catch (error: InstanceType<BadRequestException>) {
        expect(error.response.message).toEqual(messages)
      }
    })
  })
})
