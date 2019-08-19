## VUK BOOKSTORE API/DATABASE DOCUMENTATION
The API is built using Express, a nodejs framework for building network application.
The database is built using mongodb , a NoSQL database.
# BOOK DATA MODEL

This defines the way the books are stored in the database.
The following properties are used to model the `BooK`

- title
- category
- author
- publishDate
- description
- pageCount
- cover_photo
- notification
- created_at
- updated_at
- price
- file_id
<br>
The cover_photo will be stored in the database as binary data. the Book model has a `file_id` property which contains the book's file ID.
The book files are stored using Mongodb's GridFs as it is ideal for storing files greater than 16MB. Besides that , its a cool way of storing files altogether.<br>

# The USER DATA MODEL
This defines the way the users are stored in the database.
This is the model used to implement authentication in our application.
I'm using passport, a nodejs package to implement local authentication in our application.
The user is defined using the following properties
- email
- password
- role
- books_downloaded
- books_needed
- created_at
- updated_at
<br>
`email` and `password` are used for login, `role` is used to assign roles and permissions to users in the application. The default role if not provided is `user`.
`books_downloaded` is used to store an array of books downloaded by the user.
`books_needed` is used to store an array of books needed by the user.
`created_at` and `updated_at` store Date objects of when the user is created and updated respectively. 

Alright enough hype about the database. Lets get onto the cool stuff.

### THE API
## The USER API
This enables the frontend to interact with our database, through making `GET`, `POST`, `DELETE`, `UPDATE`, `PUT` requests to our backend.
# Signing up / Registering a user
To signup a user, a post request will be sent to `http://OURWEB_ADDRESS/api/users/signup` with the necessary users's data. A user's json object is returned on successful signup, else a json error message is returned.
# Login user / signin
A post request is sent to `http://OURWEB_ADDRESS/api/users/login` containing user's email and password. A user's json object is returned on successful login, else a json error message is returned. A cookie returned from a successful login is stored on the user's browser to enable the user navigate different pages and still stay logged in.
# Logout / signout
A post request is sent to `http://OURWEB_ADDRESS/api/users/logout` . This returns a json object with a message, `You are logged out`
# Forgot password
......This is under implementation but almost done. ..........
 ## The BOOK API
 # Creating new Book
 Make a post request to `http://OURWEB_ADDRESS/api/books/create-book` with neccessary data for creating a book. eg `title`, `author`, `cover_photo`, `publishDate` etc
 A json book object is returned if the book is created successfully else a json error object is returned.
 # Adding/ Uploading a book file e.g [.pdf, .doc etc]
 Make a post request to `http://OURWEB_ADDRESS/api/books/upload` with the book's file data.
 This returns a json file object of the file uploaded.
 # Getting all book files in the database
 A GET request to `http://OURWEB_ADDRESS/api/books/files` returns a json object with all files in our database, else it returns a json error message "No files exist".
 # Getting single book file 
 Make a get request to `http://OURWEB_ADDRESS/api/books/files/YOUR_FILENAME_HERE`. This returns a json object with that file.
 # Deleting a book file
 Make a DELETE request to `http://OURWEB_ADDRESS/api/books/files/YOUR_FILE_ID_HERE`. this returns a success message or an error message if request isn't successful
# Getting all books
 N:B A GET request to `http://OURWEB_ADDRESS/api/books` returns a json object with all books (Note: books contain an ids pointing to book files)
# Getting one book
A GET request to `http://OURWEB_ADDRESS/api/books/ID_OF_BOOK` returns a json object with the book with that id.

**********THANKS AND FEEL FREE TO REACH OUT TO MAKE ANY SUGGESTIONS**********








