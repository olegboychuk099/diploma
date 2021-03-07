const find_user_files = 'SELECT f.id, f.name, f.invite_link, f.data FROM users u INNER JOIN users_files uf on u.id = uf.id_user INNER JOIN files f on uf.id_file = f.id where u.id=$1';
const find_user_file = 'SELECT f.id, f.name, f.invite_link, f.data FROM users u INNER JOIN users_files uf on u.id = uf.id_user INNER JOIN files f on uf.id_file = f.id where u.id=$1 AND f.id=$2';
const add_file_to_user = 'INSERT INTO files (name, data) VALUES ($1, $2) RETURNING id, invite_link, name, data';
const delete_user_file = 'DELETE FROM files where id=$1';
const add_reference_file_to_user = 'INSERT INTO users_files (id_user, id_file) VALUES ($1, $2)';

module.exports = {
  add_reference_file_to_user,
  add_file_to_user,
  find_user_files,
  find_user_file,
  delete_user_file
}
