exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    username: {
      // For reference, GitHub limits usernames to 39 characters.
      type: "varchar(30)", //variable character
      notNull: true,
      unique: true,
    },
    email: {
      // Why 254? https://stackoverflow.com/q/1199190
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    password: {
      // Why 60? https://www.npmjs.com/package/bcrypt#hash-info
      type: "varchar(60)",
      notNull: true,
    },
    created_at: {
      // Why timezone? https://justatheory.com/2012/04/postgres-use-timestamptz/
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },
    updated_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },
  });
};

exports.down = false;
