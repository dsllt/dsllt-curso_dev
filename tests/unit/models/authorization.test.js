const { InternalServerError } = require("infra/errors");
const { default: authorization } = require("models/authorization");

describe("models/authorization.js", () => {
  describe(".can()", () => {
    test("without `user`", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });
    test("without `user.features`", () => {
      const user = {
        username: "UserWithoutFeatures",
      };
      expect(() => {
        authorization.can(user);
      }).toThrow(InternalServerError);
    });

    test("with unknown `feature`", () => {
      const user = {
        features: [],
      };
      expect(() => {
        authorization.can(user, "unknown:feature");
      }).toThrow(InternalServerError);
    });
    test("with valid user and known `feature`", () => {
      const user = {
        features: "read:user",
      };
      expect(authorization.can(user, "read:user")).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    test("without `user`", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });
    test("without `user.features`", () => {
      const user = {
        username: "UserWithoutFeatures",
      };
      expect(() => {
        authorization.filterOutput(user);
      }).toThrow(InternalServerError);
    });

    test("with unknown `feature`", () => {
      const user = {
        features: [],
      };
      expect(() => {
        authorization.filterOutput(user, "unknown:feature");
      }).toThrow(InternalServerError);
    });
    test("with valid user, known `feature` and no `resource`", () => {
      const user = {
        features: "read:user",
      };
      expect(() => {
        authorization.filterOutput(user, "unknown:feature");
      }).toThrow(InternalServerError);
    });
    test("with valid user, known `feature` and `resource`", () => {
      const user = {
        features: "read:user",
      };
      const resource = {
        id: 1,
        username: "resource",
        features: "read:user",
        email: "resource@email.com",
        password: "resource",
        created_at: "2026-01-01T00:00:00.00Z",
        updated_at: "2026-01-01T00:00:00.00Z",
      };
      const result = authorization.filterOutput(user, "read:user", resource);
      expect(result).toEqual({
        id: 1,
        username: "resource",
        features: "read:user",
        created_at: "2026-01-01T00:00:00.00Z",
        updated_at: "2026-01-01T00:00:00.00Z",
      });
    });
  });
});
