DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(60)  NOT NULL,
  password VARCHAR(60) NOT NULL,
  email VARCHAR(60) PRIMARY KEY NOT NULL
);

DROP TABLE IF EXISTS pdf CASCADE;
CREATE TABLE IF NOT EXISTS users (
  pdf_id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS users_to_pdf CASCADE;
CREATE TABLE IF NOT EXISTS users (
  email VARCHAR(60) NOT NULL,
  pdf_id INT NOT NULL,
  FOREIGN KEY (email) REFERENCES users (email) ON DELETE CASCADE,
  FOREIGN KEY (pdf_id) REFERENCES pdf (pdf_id) ON DELETE CASCADE
);

INSERT INTO users (username, password, email) VALUES
('ek3', 'password123', 'ekthree@gmail.com'),
('coinflip', 'complexpw', 'frankthetank@yahoo.com'),
('profeggman','collectrings','eggman@colorado.edu');

INSERT INTO pdf (name) VALUES
('test.pdf'),
('discrete.pdf'),
('book.pdf');

INSERT INTO users_to_pdf (email, pdf_id) VALUES
('ekthree@gmail.com', 1),
('eggman@colorado.edu', 2),
('ekthree@gmail.com', 3);