# NodeJS_WebApplication
___Demonstration of  API Interface Between Nodejs Web Application and MSSQL Database___

__Simple Web Application Connected to MSSQL Database__
- Everything Starts at app.js, the first page is login page
- Every Routing refer to route.js
- Authenticate Middleware stored into cookies to check user permission
- Users information stored as SQL database and required for login
- Javascript to run screen loading features, control element properties (Simple of UX/UI design)
- using EJS as view to display dynamic html tables according to queried data 

__Highlight__
- Excel Import Function directly connects and sends data to SQL
- Preview Feature to preview data in Excel before import using Multer package
- Real Application deployed on IIS that using URL Rewriter to reverse proxy into application port and run PM2 as a service(Web.config detail)
