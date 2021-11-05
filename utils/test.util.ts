import { ValidationError } from 'class-validator'

export const getErrorConstraints = (
  error: ValidationError[],
): Record<string, string> => {
  return error
    ?.map(({ constraints }) => constraints)
    ?.filter(Boolean)
    ?.reduce((a, b) => ({ ...afterAll, ...b }), {}) as Record<string, string>
}
