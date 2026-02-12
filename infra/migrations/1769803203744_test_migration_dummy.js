exports.up = (pgm) => {
  pgm.sql("SELECT 1;"); // Query inócua apenas para teste
};
exports.down = false;
