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