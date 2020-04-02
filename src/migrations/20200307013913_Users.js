
exports.up = knex => knex.schema.createTable('users', table => {
    table.bigIncrements('id');
    table.string('username', 255);
    table.string('displayname', 255);
    table.string('email', 255);
    table.string('passwordhash', 64);
    table.timestamps(undefined, true);
    table.unique('username');
  });

exports.down = knex => knex.schema.dropTable('users');
