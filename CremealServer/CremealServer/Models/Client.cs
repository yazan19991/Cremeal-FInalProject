using CremealServer.Models.DAL;
using CremealServer.Models.Responses;

namespace CremealServer.Models
{
    /// <summary>
    /// Represents a client within the system, providing functionality to handle user operations such as sign-up, sign-in, and updating information.
    /// </summary>
    public class Client
    {

        /// <summary>
        /// Gets or sets the unique identifier for the user.
        /// </summary>
        public int UserId { get; set; }
        /// <summary>
        /// Gets or sets the name of the client.
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Gets or sets the email address of the client.
        /// </summary>
        public string Email  { get; set; }
        /// <summary>
        /// Gets or sets the hashed password of the client.
        /// </summary>
        public string? HashedPassword { get; set; }
        /// <summary>
        /// Gets or sets details of any allergies the client may have.
        /// </summary>
        public string AllergicTo { get; set; }
        /// <summary>
        /// Gets or sets the religion identifier for the client.
        /// </summary>
        public int Religion { get; set; }

        /// <summary>
        /// Gets or sets the number of coins the client has.
        /// </summary>
        public int Coins { get; set; }

        /// <summary>
        /// Registers a new user by signing up the client and returns the response.
        /// </summary>
        /// <returns>A <see cref="Response{Int32}"/> containing the result of the sign-up operation.</returns>
        public Response<Int32> SignUp()
        {
            Email = Email.ToLower();
            GeneralDBservices dbs = new GeneralDBservices();
            return dbs.SignUpUser(this);
        }

        /// <summary>
        /// Signs in a user with the specified email and retrieves the user's details.
        /// </summary>
        /// <param name="email">The email address of the user.</param>
        /// <param name="password">The hashed password of the user.</param>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>A <see cref="ClientDTO"/> containing the user's details, or <c>null</c> if the sign-in fails.</returns>
        public static ClientDTO? SignIn(string email, out string password, out int? userId)
        {
            email = email.ToLower();
            GeneralDBservices dbs = new GeneralDBservices();
            return dbs.GetUserByEmail(email, out password, out userId);
        }


        /// <summary>
        /// Generates a reset code for the specified email and retrieves the user ID.
        /// </summary>
        /// <param name="email">The email address for which to generate the reset code.</param>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>The generated reset code.</returns>
        public static string GetGeneratedCode(string email, out int userId)
        {
            GeneralDBservices dbs = new GeneralDBservices();
            return dbs.ResetePasswordGetUserId(email, out userId);
        }

        /// <summary>
        /// Verifies the reset code for a user with the specified user ID.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <param name="code">The reset code to verify.</param>
        /// <returns>A message indicating the result of the verification.</returns>
        public static string VerifyResetCode(int userId, string code)
        {
            GeneralDBservices dbs = new GeneralDBservices();
            return dbs.VerfieEmailDB(userId, code);
        }

        /// <summary>
        /// Resets the password for a user with the specified user ID.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <param name="password">The new password to set.</param>
        /// <returns>A message indicating the result of the password reset.</returns>
        public static string ResetPassword(int userId, string password)
        {
            GeneralDBservices dbs = new GeneralDBservices();
            return dbs.ResetPassword(userId, password);
        }

        /// <summary>
        /// Updates the information for the current client.
        /// </summary>
        /// <returns>A message indicating the result of the update operation.</returns>
        public string UpdateInformation()
        {
            GeneralDBservices dbs = new GeneralDBservices();
            return dbs.UpdateUser(this);
        }

        /// <summary>
        /// Processes a payment for a specified plan using the user's ID.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <param name="planId">The identifier of the plan to be paid for.</param>
        /// <returns>A message indicating the result of the payment operation.</returns>
        public static string PayForPlan(int userId, int planId)
        {
            GeneralDBservices dbs = new GeneralDBservices();
            return dbs.PayForPlan(userId, planId);
        }


        public static object GetUserRligonAndAlergens(int userId)
        {
            GeneralDBservices dbs = new GeneralDBservices();
            return dbs.GetUserRligonAndAlergens(userId);
        }
    }
}
