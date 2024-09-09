using System.Data.SqlClient;
using System.Data;
using CremealServer.Models.Services;
using CremealServer.Models.Responses;

namespace CremealServer.Models.DAL
{
    public partial class GeneralDBservices
    {

        /// <summary>
        /// Signs up a new user by inserting their information into the database.
        /// </summary>
        /// <param name="user">The <see cref="Client"/> object containing user information to be inserted.</param>
        /// <returns>A <see cref="Response{Int32}"/> object containing the user ID of the newly created user and a <see cref="ResponseMessage"/> indicating the status of the operation.</returns>
        /// <remarks>
        /// This method connects to the database and executes a stored procedure to insert the user data. 
        /// It logs the operation's success or failure and returns a response with the result.
        /// In case of an exception, the error is logged and a response with an error message is returned.
        /// </remarks>
        public Response<Int32> SignUpUser(Client user)
        {
            OurLogger logger = OurLogger.Instance;

            try
            {
                using (var con = connect(Helpers.DATABASE_CONNECTION_NAME))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@UserName", user.Name },
                        { "@UserEmail", user.Email },
                        { "@Password", user.HashedPassword },
                        { "@Allergic", user.AllergicTo },
                        { "@ReligionId", user.Religion }
                    };

                    using (var cmd = CreateCommandWithStoredProcedure("spInsertUser", con, paramDic, true))
                    {
                        int userId = Convert.ToInt32(cmd.ExecuteScalar()); // returning the id
                        int status = Convert.ToInt32(cmd.Parameters["@Status"].Value);
                        string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();
                        logger.LogInfo($"The user {user.Email} has signed up to the system this is the sql message:" + statusMessage);
                        return new Response<int>()
                        {
                            Data = userId,
                            Message = new ResponseMessage(status, statusMessage)
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError("SQL-ERORR An error occurred while signing up the user." + ex.Message);
                return new Response<int>()
                {
                    Data = 0,
                    Message = new ResponseMessage(500, "An error occurred while signing up the user.")
                };
            }
        }

        /// <summary>
        /// Retrieves user information by email from the database.
        /// </summary>
        /// <param name="email">The email address of the user to retrieve.</param>
        /// <param name="password">The password associated with the user, or null if not found.</param>
        /// <param name="userId">The user ID of the retrieved user, or null if not found.</param>
        /// <returns>A <see cref="ClientDTO"/> object containing the user's information, or null if the user is not found.</returns>
        /// <remarks>
        /// This method connects to the database and executes a stored procedure to fetch user data based on the provided email.
        /// The retrieved information includes the user's name, email, allergic conditions, religion, history, and coins.
        /// The method returns a <see cref="ClientDTO"/> object populated with the user's data. 
        /// If the user is found, the password and user ID are also set through the out parameters.
        /// In case of an error, an <see cref="ApplicationException"/> is thrown with a descriptive message.
        /// </remarks>
        public ClientDTO? GetUserByEmail(string email, out string password, out int? userId)
        {
            password = null;
            userId = null;
            ClientDTO user = null;
            OurLogger logger = OurLogger.Instance;

            using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME))
            {
                try
                {
                    Dictionary<string, object> paramDic = new Dictionary<string, object>
                    {
                        { "@insertedEmail", email }
                    };

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spGetUserByEmail", con, paramDic, true))
                    {
                        using (SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection))
                        {
                            if (dataReader.Read())
                            {
                                user = new ClientDTO
                                {
                                    Name = dataReader["user_name"].ToString(),
                                    Email = dataReader["user_email"].ToString(),
                                    AllergicTo = dataReader["allergic_to"].ToString().ToLower(),
                                    Religion = dataReader["religion_title"].ToString(),
                                    Coins = Convert.ToInt32(dataReader["coins"])
                                };
                                password = dataReader["password"].ToString();
                                userId = Convert.ToInt32(dataReader["userId"]);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError("GetUserByEmail An error occurred while retrieving user data. - " + ex);
                    return null;
                }
            }
            string addetional = user == null ? "No user in the system" : "";
            logger.LogInfo($"Returen the values for the user going by: \"{email}\" using the email for the sign in function {addetional}");
            return user;
        }
        /// <summary>
        /// Retrieves the religion ID and allergen list for a specified user.
        /// </summary>
        /// <param name="userId">The ID of the user to retrieve information for.</param>
        /// <returns>
        /// An anonymous object containing the user's religion ID and an array of allergen IDs,
        /// or null if no data is found.
        /// </returns>
        /// <exception cref="Exception">Thrown when an error occurs while retrieving the data.</exception>
        public Object GetUserRligonAndAlergens(int userId)
        {
            OurLogger logger = OurLogger.Instance;

            using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME))
            {
                try
                {
                    Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@user_id", userId }
            };

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spGetSelectedValuesRA", con, paramDic, true))
                    {
                        using (SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection))
                        {
                            if (dataReader.Read())
                            {
                                string allergicToString = dataReader["allergic_to"].ToString().ToLower();

                                int[] allergicToArray = string.IsNullOrEmpty(allergicToString)
                                    ? new int[0]
                                    : allergicToString.Split(',')
                                                      .Select(s => int.TryParse(s, out int value) ? value : (int?)null)
                                                      .Where(v => v.HasValue)
                                                      .Select(v => v.Value)
                                                      .ToArray();

                                logger.LogInfo($"Loaded the religion and the allergens for the user {userId}");
                                return new
                                {
                                    religion_id = Convert.ToInt32(dataReader["religion_id"]),
                                    allergic_to = allergicToArray,
                                };
                            }
                        }
                    }
                    logger.LogInfo($"Nothing returned for the user - {userId}");
                    return null;
                }
                catch (Exception ex)
                {
                    logger.LogError("GetUserRligonAndAlergens An error occurred while retrieving user data. - " + ex);
                    return null;
                }
            }
        }


        /// <summary>
        /// Generates a password reset code for a user identified by their email address.
        /// </summary>
        /// <param name="email">The email address of the user requesting a password reset.</param>
        /// <param name="userId">
        /// When this method returns, contains the user ID associated with the provided email address, 
        /// or -1 if the user ID could not be retrieved.
        /// </param>
        /// <returns>
        /// A string representing the generated password reset code, or throws an exception if an error occurs.
        /// </returns>
        /// <exception cref="ApplicationException">
        /// Thrown when a database error occurs, an unexpected error occurs, or the operation fails.
        /// </exception>
        /// <exception cref="InvalidOperationException">
        /// Thrown when the user ID could not be retrieved and the operation failed.
        /// </exception>
        /// <remarks>
        /// This method connects to the database and executes a stored procedure to retrieve the user ID based on the provided email.
        /// If the user ID is successfully retrieved, a random reset code is generated and stored in the database.
        /// In case of an error, appropriate exceptions are thrown and logged.
        /// </remarks>
        public string ResetePasswordGetUserId(string email, out int userId)
        {
            userId = -1;
            try
            {
                using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@user_email", email }
                    };

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spGanAccessToResetePasswordGetUserId", con, paramDic, true))
                    {
                        userId = Convert.ToInt32(cmd.ExecuteScalar());

                        // Check for output parameters if any
                        var statusParam = cmd.Parameters["@statusMessage"];
                        string status = statusParam != null ? statusParam.Value.ToString() : null;

                        if (userId < 0)
                        {
                            throw new InvalidOperationException(status ?? "Failed to retrieve user ID.");
                        }

                        string code = Models.Helpers.GenerateRandomString();
                        InsertResetCodeToDB(userId, code);

                        return code;
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                OurLogger.Instance.LogError($"SQL error while resetting password: {sqlEx.Message}");
                throw new ApplicationException("Database error occurred while processing your request.", sqlEx);
            }
            catch (InvalidOperationException invOpEx)
            {
                OurLogger.Instance.LogError($"Operation error: {invOpEx.Message}");
                throw;
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"An error occurred: {ex.Message}");
                throw new ApplicationException("An unexpected error occurred. Please try again later.", ex);
            }
        }


        /// <summary>
        /// Inserts a password reset code into the database for the specified user.
        /// </summary>
        /// <param name="userId">The ID of the user for whom the reset code is being inserted. Must be greater than 0.</param>
        /// <param name="code">The password reset code to be inserted into the database. Cannot be null or empty.</param>
        /// <exception cref="ArgumentException">
        /// Thrown when the <paramref name="userId"/> is less than or equal to 0, or when the <paramref name="code"/> is null or empty.
        /// </exception>
        /// <exception cref="InvalidOperationException">
        /// Thrown when a database error occurs while inserting the reset code or when an unexpected error occurs.
        /// </exception>
        /// <remarks>
        /// This method creates a connection to the database and executes a stored procedure to insert the provided reset code for the specified user.
        /// If the <paramref name="userId"/> is invalid or the <paramref name="code"/> is null or empty, an <see cref="ArgumentException"/> is thrown.
        /// SQL-specific errors and other exceptions are logged and wrapped in an <see cref="InvalidOperationException"/>.
        /// </remarks>
        private void InsertResetCodeToDB(int userId, string code)
        {
            if (userId <= 0)
            {
                throw new ArgumentException("Invalid user ID.", nameof(userId));
            }

            if (string.IsNullOrWhiteSpace(code))
            {
                throw new ArgumentException("Code cannot be null or empty.", nameof(code));
            }

            try
            {
                using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME)) // Create the connection
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@userId", userId },
                        { "@generatedCode", code }
                    };

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spInsertGeneratedCode", con, paramDic, true))
                    {
                        cmd.ExecuteNonQuery();
                    }
                }
            }
            catch (SqlException ex)
            {
                // Log SQL-specific exceptions
                OurLogger.Instance.LogError($"SQL Error in InsertResetCodeToDB: {ex.Message}");
                throw new InvalidOperationException("Database error occurred while inserting reset code.", ex);
            }
            catch (Exception ex)
            {
                // Log general exceptions
                OurLogger.Instance.LogError($"Error in InsertResetCodeToDB: {ex.Message}");
                throw new InvalidOperationException("An error occurred while inserting reset code.", ex);
            }
        }



        /// <summary>
        /// Verifies a user and code against the database to complete an password reset verification process.
        /// </summary>
        /// <param name="userId">The user ID associated with the reset verification request.</param>
        /// <param name="code">The verification code that was generated and sent to the user.</param>
        /// <returns>
        /// A string indicating the status message of the verification process. If successful, it returns a success message.
        /// If there is an error, it returns an error message.
        /// </returns>
        /// <remarks>
        /// This method connects to the database and executes a stored procedure to verify the provided user ID and code.
        /// If the verification is successful (indicated by a status code of 0), it logs the success and returns the status message.
        /// If the verification fails or an error occurs, it throws an exception or returns an error message after logging the error.
        /// </remarks>
        /// <exception cref="Exception">
        /// Thrown if the verification fails and the stored procedure returns a non-zero status code.
        /// </exception>
        public string VerfieEmailDB(int userId, string code)
        {
            try
            {

                using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        {"@userId", userId },
                        {"@generatedCode", code}
                    };

                    SqlCommand cmd = CreateCommandWithStoredProcedure("spVerfieUser", con, paramDic, true);

                    cmd.ExecuteScalar();

                    string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();
                    int statusCode = Convert.ToInt32(cmd.Parameters["@status"].Value);

                    if (statusCode == 0)
                    {
                        OurLogger.Instance.LogInfo($"The user has been verfied succefuly - userId {userId}");
                        return statusMessage;
                    }
                    else
                    {
                        throw new InvalidOperationException(statusMessage);
                    }
                }
            }
            catch (Exception ex)
            {

                OurLogger.Instance.LogError("Could not verfie the user for reseting the password - " + ex.Message);
                throw new Exception("An error occurred while verifying the user for reseting the password.");
            }
        }



        /// <summary>
        /// Resets the password for the specified user.
        /// </summary>
        /// <param name="userId">The ID of the user whose password is being reset. Must be greater than 0.</param>
        /// <param name="password">The new password for the user. Cannot be null or empty.</param>
        /// <returns>A string indicating the status of the password reset operation. If successful, it returns a success message.
        /// Otherwise, it throws an exception with an appropriate error message.</returns>
        /// <exception cref="ArgumentException">
        /// Thrown when the <paramref name="userId"/> is less than or equal to 0, or when the <paramref name="password"/> is null or empty.
        /// </exception>
        /// <exception cref="InvalidOperationException">
        /// Thrown when a database error occurs while resetting the password or when an unexpected error occurs.
        /// </exception>
        /// <remarks>
        /// This method connects to the database and executes a stored procedure to update the password for the specified user.
        /// If the <paramref name="userId"/> is invalid or the <paramref name="password"/> is null or empty, an <see cref="ArgumentException"/> is thrown.
        /// SQL-specific errors and other exceptions are logged and wrapped in an <see cref="InvalidOperationException"/>.
        /// </remarks>
        public string ResetPassword(int userId, string password)
        {
            if (userId <= 0)
            {
                throw new ArgumentException("Invalid user ID.", nameof(userId));
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                throw new ArgumentException("Password cannot be null or empty.", nameof(password));
            }

            try
            {
                using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@userId", userId },
                        { "@new_password", password }
                    };

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spResetPassword", con, paramDic, true))
                    {

                        cmd.ExecuteNonQuery();

                        string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();
                        int statusCode = Convert.ToInt32(cmd.Parameters["@status"].Value);

                        if (statusCode == 0)
                        {
                            return statusMessage;
                        }
                        else
                        {
                            throw new InvalidOperationException(statusMessage);
                        }
                    }
                }
            }
            catch (SqlException ex)
            {

                OurLogger.Instance.LogError($"SQL Error in ResetPassword: {ex.Message}");
                throw new InvalidOperationException("Database error occurred while resetting the password.", ex);
            }
            catch (Exception ex)
            {

                OurLogger.Instance.LogError($"Error in ResetPassword: {ex.Message}");
                throw new InvalidOperationException("An error occurred while resetting the password.", ex);
            }
        }


        /// ------------------------------------------------------------------------- need to change this 

        /// <summary>
        /// Updates the user's information in the database and handles the renaming or moving of user image files.
        /// </summary>
        /// <param name="client">The client object containing updated user information.</param>
        /// <returns>A string indicating the status of the update operation. If successful, it returns a success message.
        /// Otherwise, it throws an exception with an appropriate error message.</returns>
        /// <exception cref="ArgumentException">
        /// Thrown when the <paramref name="client"/> object is invalid or contains invalid data (e.g., null or empty values).
        /// </exception>
        /// <exception cref="InvalidOperationException">
        /// Thrown when a database error occurs while updating the user's information or handling user image files,
        /// or when an unexpected error occurs.
        /// </exception>
        /// <exception cref="IOException">
        /// Thrown when an error occurs while renaming or moving user image files.
        /// </exception>
        /// <remarks>
        /// This method connects to the database and executes a stored procedure to update the user information.
        /// If the update is successful, it renames or moves the user's image file to reflect the updated email address.
        /// If any errors occur during the database update or file handling, appropriate exceptions are thrown and logged.
        /// </remarks>
        public string UpdateUser(Client client)
        {
            try
            {
                using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME)) // Create the connection
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@userId", client.UserId },
                        { "@UserName", client.Name },
                        { "@UserEmail", client.Email },
                        { "@Allergic", client.AllergicTo },
                        { "@ReligionId", client.Religion }
                    };

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spUpdateInformation", con, paramDic, true))
                    {

                        cmd.ExecuteNonQuery();

                        string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();
                        int statusCode = Convert.ToInt32(cmd.Parameters["@status"].Value);

                        if (statusCode == 0)
                        {
                            // Handle file renaming/moving
                            string oldFilePath = GetFilePath(client.UserId);
                            string newFilePath = GetNewFilePath(client.Email);

                            if (File.Exists(oldFilePath))
                            {
                                File.Move(oldFilePath, newFilePath);
                            }

                            return statusMessage;
                        }
                        else
                        {
                            throw new InvalidOperationException(statusMessage);
                        }
                    }
                }
            }
            catch (SqlException ex)
            {
                OurLogger.Instance.LogError($"SQL Error in UpdateUser: {ex.Message}");
                throw new InvalidOperationException("Database error occurred while updating user information.", ex);
            }
            catch (IOException ex)
            {
                OurLogger.Instance.LogError($"File Error in UpdateUser: {ex.Message}");
                throw new InvalidOperationException("Error occurred while handling user image files.", ex);
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"Error in UpdateUser: {ex.Message}");
                throw new InvalidOperationException("An error occurred while updating user information.", ex);
            }
        }

        /// <summary>
        /// Retrieves the file path for the user's image based on their user ID.
        /// </summary>
        /// <param name="userId">The user ID to retrieve the image path for. Must be greater than 0.</param>
        /// <returns>The full file path of the user's image.</returns>
        /// <exception cref="ArgumentException">
        /// Thrown when the <paramref name="userId"/> is less than or equal to 0.
        /// </exception>
        private string GetFilePath(int userId)
        {
            string path = Directory.GetCurrentDirectory();
            string oldFileName = $"{GetUserEmail(userId)}.jpg";
            return Path.Combine(path, "Images/UsersImages", oldFileName);
        }

        /// <summary>
        /// Retrieves the new file path for the user's image based on their updated email address.
        /// </summary>
        /// <param name="newEmail">The updated email address of the user.</param>
        /// <returns>The full file path of the user's image with the updated email.</returns>
        private string GetNewFilePath(string newEmail)
        {
            string path = Directory.GetCurrentDirectory();
            string newFileName = $"{newEmail}.jpg";
            return Path.Combine(path, "Images/UsersImages", newFileName);
        }

        /// <summary>
        /// Retrieves the email address of a user based on their user ID.
        /// </summary>
        /// <param name="userId">The ID of the user whose email is being retrieved. Must be greater than 0.</param>
        /// <returns>The email address of the user.</returns>
        /// <exception cref="ArgumentException">
        /// Thrown when the <paramref name="userId"/> is less than or equal to 0.
        /// </exception>
        /// <exception cref="InvalidOperationException">
        /// Thrown when a database error occurs while retrieving the user's email or when no email is found for the specified user ID.
        /// </exception>
        private string GetUserEmail(int userId)
        {
            if (userId <= 0)
            {
                throw new ArgumentException("Invalid user ID.", nameof(userId));
            }

            try
            {
                using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@userId", userId }
                    };

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spGetUserEmail", con, paramDic, true))
                    {
                        try
                        {
                            var result = cmd.ExecuteScalar();

                            if (result == null)
                            {
                                throw new InvalidOperationException("No email found for the specified user ID.");
                            }

                            string email = result.ToString();
                            string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();
                            int statusCode = Convert.ToInt32(cmd.Parameters["@status"].Value);

                            if (statusCode == 0)
                            {
                                return email;
                            }
                            else
                            {
                                throw new InvalidOperationException(statusMessage);
                            }
                        }
                        catch (SqlException ex)
                        {
                            OurLogger.Instance.LogError($"SQL Error in GetUserEmail: {ex.Message}");
                            throw new InvalidOperationException("Database error occurred while retrieving user email.", ex);
                        }
                        catch (Exception ex)
                        {
                            OurLogger.Instance.LogError($"Error in GetUserEmail: {ex.Message}");
                            throw new InvalidOperationException("An error occurred while retrieving user email.", ex);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"Error in GetUserEmail: {ex.Message}");
                throw new Exception("Error ecured during getting the email");
            }
        }
        /// ------------------------------------------------------------------------- 


        /// <summary>
        /// Uses one coin for a user identified by either their user ID or email.
        /// </summary>
        /// <param name="userId">The ID of the user. Optional.</param>
        /// <param name="email">The email of the user. Optional.</param>
        /// <returns>
        /// <c>true</c> if the operation was successful and a coin was used; otherwise, <c>false</c>.
        /// </returns>
        /// <exception cref="ArgumentException">
        /// Thrown when both <paramref name="userId"/> and <paramref name="email"/> are not provided or are invalid.
        /// </exception>
        /// <exception cref="InvalidOperationException">
        /// Thrown when a database error occurs while using the coin, or when an unexpected error occurs.
        /// </exception>
        /// <exception cref="Exception">
        /// Thrown when an unexpected error occurs and cannot be handled within the method.
        /// </exception>
        /// <remarks>
        /// This method connects to the database and executes a stored procedure to check the user's coin balance
        /// and use one coin if available. The user can be identified either by their ID or email. If both are provided,
        /// only the user ID is used. The method returns <c>true</c> if a coin was successfully used, indicated by a status code of 0.
        /// Any errors encountered during the process are logged and exceptions are thrown with detailed error messages.
        /// </remarks>
        public bool UseOneCoin(int? userId = null, string? email = null)
        {
            if (userId == null && string.IsNullOrWhiteSpace(email))
            {
                throw new ArgumentException("Either userId or email must be provided.");
            }

            try
            {
                using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME))
                {
                    var paramDic = new Dictionary<string, object>();

                    if (userId != null)
                    {
                        paramDic.Add("@userId", userId);
                    }
                    if (!string.IsNullOrWhiteSpace(email))
                    {
                        paramDic.Add("@userEmail", email);
                    }

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spCheckCoinsAndUse", con, paramDic, true))
                    {
                        try
                        {
                            cmd.ExecuteScalar();
                            string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();
                            int statusCode = Convert.ToInt32(cmd.Parameters["@status"].Value);
                            return statusCode == 0;
                        }
                        catch (SqlException ex)
                        {
                            OurLogger.Instance.LogError($"SQL Error in UseOneCoin: {ex.Message}");
                            throw new InvalidOperationException("Database error occurred while using the coin.", ex);
                        }
                        catch (Exception ex)
                        {
                            OurLogger.Instance.LogError($"Error in UseOneCoin: {ex.Message}");
                            throw new InvalidOperationException("An error occurred while using the coin.", ex);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"Error in UseOneCoin: {ex.Message}");
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Processes a payment for a specified plan for a user.
        /// </summary>
        /// <param name="userId">The ID of the user making the payment. Must be greater than zero.</param>
        /// <param name="planId">The ID of the plan being purchased. Must be greater than zero.</param>
        /// <returns>
        /// A status message indicating the result of the payment operation. The message will provide details
        /// on the success or failure of the payment process.
        /// </returns>
        /// <exception cref="ArgumentException">
        /// Thrown when <paramref name="userId"/> or <paramref name="planId"/> is less than or equal to zero.
        /// </exception>
        /// <exception cref="InvalidOperationException">
        /// Thrown when there is a database operation failure or general error during the payment processing.
        /// </exception>
        /// <remarks>
        /// This method validates the input parameters and executes a stored procedure to process the payment.
        /// It logs detailed error messages if the payment fails due to SQL errors or other exceptions.
        /// </remarks>
        public string PayForPlan(int userId, int planId)
        {
            // Validate input parameters
            if (userId <= 0)
            {
                throw new ArgumentException("Invalid user ID.", nameof(userId));
            }

            if (planId <= 0)
            {
                throw new ArgumentException("Invalid plan ID.", nameof(planId));
            }

            string statusMessage;

            try
            {
                using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@userId", userId },
                        { "@planId", planId }
                    };

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spInsertCoinsUsingId", con, paramDic, true))
                    {
                        try
                        {

                            cmd.ExecuteNonQuery();

                            statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();
                            int statusCode = Convert.ToInt32(cmd.Parameters["@status"].Value);

                            if (statusCode == 0)
                            {
                                return statusMessage;
                            }
                            else
                            {
                                OurLogger.Instance.LogError($"PayForPlan failed for userId {userId} with planId {planId}. Status code: {statusCode}. Message: {statusMessage}");
                                throw new Exception(statusMessage);
                            }
                        }
                        catch (SqlException ex)
                        {
                            OurLogger.Instance.LogError($"SQL Error in PayForPlan: {ex.Message}");
                            throw new InvalidOperationException("Database operation failed.", ex);
                        }
                        catch (Exception ex)
                        {
                            OurLogger.Instance.LogError($"Error in PayForPlan: {ex.Message}");
                            throw new InvalidOperationException("An error occurred while processing the payment.", ex);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"Error in PayForPlan: {ex.Message}");
                throw new Exception("Error occurred while processing the payment.", ex);
            }
        }
    }
}
