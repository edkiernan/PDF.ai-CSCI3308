DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(60)  NOT NULL,
  password VARCHAR(60) NOT NULL,
  email VARCHAR(60) PRIMARY KEY NOT NULL
);

DROP TABLE IF EXISTS pdf CASCADE;
CREATE TABLE IF NOT EXISTS pdf (
  pdf_id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS users_to_pdf CASCADE;
CREATE TABLE IF NOT EXISTS users_to_pdf (
  email VARCHAR(60) NOT NULL,
  pdf_id INT NOT NULL,
  FOREIGN KEY (email) REFERENCES users (email) ON DELETE CASCADE,
  FOREIGN KEY (pdf_id) REFERENCES pdf (pdf_id) ON DELETE CASCADE
);

INSERT INTO users (username, password, email) VALUES ('ek3', 'password123', 'ekthree@gmail.com');
INSERT INTO users (username, password, email) VALUES ('coinflip', 'complexpw', 'frankthetank@yahoo.com');
INSERT INTO users (username, password, email) VALUES ('profeggman','collectrings','eggman@colorado.edu');

INSERT INTO pdf (name) VALUES ('test.pdf');
INSERT INTO pdf (name) VALUES ('discrete.pdf');
INSERT INTO pdf (name) VALUES ('book.pdf');

INSERT INTO users_to_pdf (email, pdf_id) VALUES ('ekthree@gmail.com', 1);
INSERT INTO users_to_pdf (email, pdf_id) VALUES ('eggman@colorado.edu', 2);
INSERT INTO users_to_pdf (email, pdf_id) VALUES ('ekthree@gmail.com', 3);

\dt;