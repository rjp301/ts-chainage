import formatKP from "./formatKP.js";

describe("formatKP", () => {
  test("over one thousand", () => {
    expect(formatKP(1245)).toEqual("1+245");
  });
  test("zero", () => {
    expect(formatKP(0)).toEqual("0+000");
  });
  test("under one thousand", () => {
    expect(formatKP(40)).toEqual("0+040");
  });
  test("over one hundred thousand", () => {
    expect(formatKP(1245001)).toEqual("1245+001");
  });
});
