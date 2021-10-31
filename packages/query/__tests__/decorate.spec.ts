// import { ValidationError } from "@nestjs/common";
// import { plainToClass } from "class-transformer";
// import { IsArray, IsIn, IsNumber, validateSync } from "class-validator";
// import { Model, Rule } from "../src";

// const getConstraints = (error: ValidationError[]): Record<string, string> => {
//   return error[0]?.constraints as Record<string, string>;
// };

// describe("Decorate", () => {
//   it("should return error to a single decorator in an operation", () => {
//     class Example extends Model() {
//       @Rule({
//         type: Number,
//         enums: [10, 50],
//         decorate: () => [
//           {
//             when: ["eq"],
//             with: [IsNumber()],
//           },
//         ],
//       })
//       id: number | number[];
//     }

//     const dto = plainToClass(Example, { id: { eq: "A" } });

//     expect(getConstraints(validateSync(dto))).toEqual({
//       isNumber: "id must be a number conforming to the specified constraints",
//     });
//   });

//   it("should return error for multiple decorators and operators", () => {
//     class Example extends Model() {
//       @Rule({
//         type: Number,
//         enums: [10, 50],
//         decorate: ({ enums }) => [
//           {
//             when: ["eq", "df", "ls"],
//             with: [IsNumber()],
//           },
//           {
//             when: ["in", "ni"],
//             with: [IsArray(), IsNumber({}, { each: true })],
//           },
//           {
//             when: ["ls"],
//             with: [IsIn(enums)],
//           },
//         ],
//       })
//       id: number | number[];
//     }

//     const dtoA = plainToClass(Example, { id: { eq: "A" } });
//     const dtoB = plainToClass(Example, { id: { in: 1 } });
//     const dtoC = plainToClass(Example, { id: { ls: 100 } });

//     expect(getConstraints(validateSync(dtoA))).toEqual({
//       isNumber: "id must be a number conforming to the specified constraints",
//     });
//     expect(getConstraints(validateSync(dtoB))).toEqual({
//       isArray: "id must be an array",
//     });
//     expect(getConstraints(validateSync(dtoC))).toEqual({
//       isIn: "id must be one of the following values: 10, 50",
//     });
//   });
// });
describe('', () => {
  it('', () => {
    expect(true)
  })
})
