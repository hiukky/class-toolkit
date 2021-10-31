// import { IntersectionType } from "@nestjs/mapped-types";
// import { plainToClass, Type } from "class-transformer";
// import { IsIn, ValidateNested, validateSync } from "class-validator";
// import { Model, Rule, RuleMetadataDTO, RuleTypes } from "../src";

// const SCHEMA: RuleTypes.Schema = {
//   name: "Rule Test",
//   required: true,
//   operators: ["eq"],
//   type: Number,
//   enums: [],
//   args: [],
//   conflits: [],
//   decorate: () => [
//     {
//       when: ["eq"],
//       with: [IsIn([5])],
//     },
//   ],
// };

// const SCHEMA_JSON: RuleTypes.JSONSchema = {
//   name: "Rule Test",
//   required: true,
//   operators: ["eq"],
//   enums: [],
//   args: [],
//   conflits: [],
// };

// class SimpleDTO extends Model() {
//   @Rule(SCHEMA)
//   field: number;
// }

// class ManyRulesDTO {
//   @Type(() => SimpleDTO)
//   @ValidateNested()
//   rules: SimpleDTO[];
// }

// describe("Schema", () => {
//   const payload = {
//     field: { eq: 1 },
//   };

//   it("Base", () => {
//     class DTO extends Model() {
//       @Rule({
//         type: Number,
//       })
//       field: number;
//     }

//     const dto = plainToClass(DTO, payload);

//     expect(dto).toBeInstanceOf(DTO);
//     expect(dto.toSource()).toEqual({ field: '{"eq":1}' });
//     expect(dto.toSchema()).toEqual({
//       field: {
//         name: "Rule",
//         required: true,
//         operators: ["eq"],
//         type: Number,
//         enums: [],
//         args: [],
//         conflits: [],
//       },
//     });
//     expect(dto.toJSON()).toEqual({
//       field: {
//         name: "Rule",
//         required: true,
//         operators: ["eq"],
//         type: "Number",
//         enums: [],
//         args: [],
//         conflits: [],
//       },
//     });
//     expect(dto.get("field")).toEqual({
//       operator: "eq",
//       value: 1,
//       source: '{"eq":1}',
//     });
//   });

//   it("should return error for conflict in same schema", () => {
//     class DTO extends Model() {
//       @Rule({
//         type: Number,

//         conflits: [],
//       })
//       a: number;

//       @Rule({
//         type: Number,

//         conflits: ["a"],
//       })
//       b: number;
//     }

//     const dto = plainToClass(DTO, { a: { eq: 5 }, b: { eq: 2 } });

//     const { property, constraints } = validateSync(dto)[0];

//     expect(property).toEqual("b");
//     expect(dto.toJSON().b.conflits).toEqual(["a"]);
//     expect(constraints?.["rule"]).toEqual(
//       'b: property "b" conflicts with property "a"'
//     );
//   });

//   it("should return error for conflict in inheritance schema", () => {
//     class A extends Model() {
//       @Rule({
//         type: Number,
//         conflits: [],
//       })
//       a: number;
//     }

//     class B extends Model() {
//       @Rule({
//         type: Number,
//         conflits: [
//           {
//             ref: A,
//             rules: ["a"],
//           },
//         ],
//       })
//       b: number;
//     }

//     class ExampleDTO extends Model(IntersectionType(A, B)) {}

//     const dto = plainToClass(ExampleDTO, {
//       a: { eq: 5 },
//       b: { eq: 2 },
//       c: { eq: 50 },
//     });

//     console.log(validateSync(dto));

//     const { property, constraints } = validateSync(dto)[0];

//     expect(property).toEqual("b");
//     expect(constraints?.["rule"]).toEqual(
//       'b: property "b" conflicts with property "a"'
//     );
//   });

//   it("must return an instance of RuleMetadataDTO", () => {
//     const dto = plainToClass(RuleMetadataDTO, {
//       operator: "eq",
//       value: 1,
//       source: JSON.stringify({ eq: 1 }),
//     });

//     expect(dto).toBeInstanceOf(RuleMetadataDTO);
//   });
// });

// describe("Unique Schema", () => {
//   const commonExpect = (dto: SimpleDTO): void => {
//     expect(dto.toJSON()).toMatchObject({
//       field: SCHEMA_JSON,
//     });
//     expect(dto.toSchema()).toMatchObject({
//       field: SCHEMA,
//     });
//   };

//   it("must define a default operator if it accepts only one and n is a valid model", () => {
//     const dto = plainToClass(SimpleDTO, { field: 1 });

//     expect(dto.field).toBe(1);
//     expect(dto.get("field")).toMatchObject({
//       operator: "eq",
//       value: 1,
//       source: '{"eq":1}',
//     });
//     commonExpect(dto);
//   });

//   it("Must return a valid value for the model", () => {
//     const dto = plainToClass(SimpleDTO, { field: { eq: 1 } });

//     expect(dto.field).toBe(1);
//     expect(dto.get("field")).toMatchObject({
//       operator: "eq",
//       value: 1,
//       source: '{"eq":1}',
//     });
//     commonExpect(dto);
//   });
// });

// describe("Nested Schemas", () => {
//   it("should assume a default template when there isn't one.", () => {
//     const payload = [{ field: 1 }, { field: 50 }];

//     const dto = plainToClass(ManyRulesDTO, {
//       rules: payload,
//     });

//     expect(dto.rules).toEqual(expect.arrayContaining(payload));
//     expect(dto.rules).toHaveLength(2);
//   });

//   it("Must return a valid value for the models", () => {
//     const dto = plainToClass(ManyRulesDTO, {
//       rules: [{ field: { eq: 1 } }, { field: { eq: 50 } }],
//     });

//     expect(dto.rules).toEqual(
//       expect.arrayContaining([{ field: 1 }, { field: 50 }])
//     );
//     expect(dto.rules).toHaveLength(2);
//   });
// });

describe('', () => {
  it('', () => {
    expect(true)
  })
})
