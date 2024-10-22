<!-- IR SOLUTIONS TASK -->

Below are the steps and detailed explanations to set up and run the module effectively. Please follow each step carefully to ensure a smooth installation and testing process.

1. Install Dependencies => To begin, ensure that all required dependencies for the module are installed. Execute the following command in your terminal: (nmp install). This command will download and install all the necessary packages specified in the package.json file.

2. Configure Environment Variables => An .env file is provided for configuring the environment variables required for the application. If you encounter an issue with the .env file not being available in the repository, please create a new .env file in the root directory of your project and include the following variables:

<!-- MONGODB_URI='mongodb://127.0.0.1:27017/IrSolutions'
JWT_SECRET='HMAC'
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379 -->

Make sure to uncomment this code after pasting it into the .env file.

3. Database Tables Overview => The application operates with three main tables:
   a) Users: Contains user information and roles.
   b) Projects: Holds project details.
   c) Tasks: Stores task-related data associated with projects.

4. User Authentication and Role Assignment => To understand the flow of the application, follow these steps:

   a) Create a User: Begin by creating a user account. You can assign roles of your choice (e.g., Admin, Manager, Member) to this user during creation.

b) Login: After creating the user, log in using the provided credentials. Successful authentication will grant access to additional routes.

c) Session Management: Note that user sessions will expire after a set duration. Once expired, users will need to log in again to regain access.

5. Token Generation => Upon successful login with valid credentials, a JSON Web Token (JWT) will be generated. This token is essential for accessing protected routes. In Postman, include the generated token in the request headers as follows:  
   Key: Authorization
   Value: Bearer <generated-token>

Replace <generated-token> with the actual token received upon login.

6.  User Operations => The following user-related operations are supported:

    a) createUser: Create a new user.
    b) getAllUsers: Retrieve a list of all users.
    c) findOneUser: Fetch details of a specific user.
    d) updateUser: Modify user information.
    e) getUsersWithTaskCounts: Retrieve users along with their respective task counts.

7.  Project Management => Users can perform various project-related operations, including:

    a) findAllProjects: Retrieve all projects.
    b) createProject: Create a new project.
    c) findOneProject: Fetch details of a specific project.
    d) getProjectsWithUserTaskCounts: Get projects along with task counts for each user.

8.  Task Management => According to project requirements, users can also manage tasks through the following operations:
    a) createTask: Create a new task.
    b) completion-summary: Get a summary of completed tasks.
    c) user-performance: Retrieve performance metrics for users.
    d) overdue-summary: Fetch a summary of overdue tasks.
    e) project-summary: Get a summary of tasks related to a specific project.
    f) getTasks: Retrieve all tasks.

9.  Caching and Performance Optimization => Caching has been implemented in various parts of the application to enhance performance and reduce response times.

10. Filtering and Pagination => Both filtering and pagination features are integrated into the API to improve data retrieval efficiency and user experience.

11. API Testing => API collections for testing have been shared previously. You can use these collections in Postman to test all the available APIs systematically.

12. Support and Clarifications => If you encounter any issues or require further clarification regarding any aspect of the module, please do not hesitate to reach out. I am here to assist you.

I look forward to your prompt response so that we can get started on this project, InshaAllah!

Best regards,

Muhammad Anas
0332-5671622
