using CremealServer.Models.Responses;
using CremealServer.Models.Services;
using System.Net.Mail;
using System.Text;

namespace CremealServer.Models
{
    public static class Helpers
    {
        /// <summary>
        /// The name of the database connection string in the configuration.
        /// </summary>
        public const string DATABASE_CONNECTION_NAME = "DBConnection";

        /// <summary>
        /// The length of the code used for various purposes such as user verification or temporary access.
        /// </summary>
        private const int CODE_LENGTH = 5;

        /// <summary>
        /// The set of characters used for generating random codes, including uppercase letters, lowercase letters, and digits.
        /// </summary>
        private static readonly string Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        /// <summary>
        /// A random number generator used for generating random codes and other random values.
        /// </summary>
        private static readonly Random Random = new Random();

        /// <summary>
        /// Reads an HTML template file, replaces placeholders with the provided values, and returns the resulting HTML string.
        /// The placeholders are replaced with the following values:
        /// <list type="bullet">
        /// <item><description>{userName} - Replaced with the <paramref name="userName"/> parameter.</description></item>
        /// <item><description>{userPasswordResetCode} - Replaced with the <paramref name="userPasswordResetCode"/> parameter.</description></item>
        /// <item><description>{currentYear} - Replaced with the current year.</description></item>
        /// </list>
        /// The method handles errors related to file I/O and unexpected exceptions by logging the errors and returning an error message.
        ///
        /// </summary>
        /// <param name="templateName">The name of the HTML template file (without the .html extension) to read.</param>
        /// <param name="userName">The username to replace the {userName} placeholder in the template.</param>
        /// <param name="userPasswordResetCode">The password reset code to replace the {userPasswordResetCode} placeholder in the template.</param>
        /// <returns>The HTML string with placeholders replaced by the provided values. Returns an error message if an exception occurs.</returns>
        public static string ReadHtmlTemplate(string templateName, string userName, string userPasswordResetCode)
        {
            OurLogger logger = OurLogger.Instance;
            try
            {
                string path = Directory.GetCurrentDirectory();
                string filePath = Path.Combine(path, "HtmlTemplates", $"{templateName}.html");

                // Read and replace placeholders in HTML template
                string htmlString = File.ReadAllText(filePath);
                // The code is not asigned and not making any problem if we read te signIn template
                htmlString = htmlString
                    .Replace("{userName}", userName)
                    .Replace("{userPasswordResetCode}", userPasswordResetCode)
                    .Replace("{currentYear}", DateTime.Now.Year.ToString());

                return htmlString;
            }
            catch (IOException ioEx)
            {
                logger.LogError("Error reading template - " + ioEx);
                return $"Ignore this message something went wrong with the server we will send you another message soon";
            }
            catch (Exception ex)
            {
                logger.LogError("An unexpected error occurred  - " + ex);
                return $"Ignore this message something went wrong with the server we will send you another message soon";
            }
        }


        public static string ReadAdminHtmlTemplate(string templateName, string userName, string body)
        {
            OurLogger logger = OurLogger.Instance;
            try
            {
                string path = Directory.GetCurrentDirectory();
                string filePath = Path.Combine(path, "HtmlTemplates", $"{templateName}.html");

                // Read and replace placeholders in HTML template
                string htmlString = File.ReadAllText(filePath);
                htmlString = htmlString
                    .Replace("{recipientEmail}", userName)
                    .Replace("{message}", body)
                    .Replace("{currentYear}", DateTime.Now.Year.ToString());

                return htmlString;
            }
            catch (IOException ioEx)
            {
                logger.LogError("Error reading template - " + ioEx);
                return $"Ignore this message. Something went wrong with the server. We will send you another message soon.";
            }
            catch (Exception ex)
            {
                logger.LogError("An unexpected error occurred - " + ex);
                return $"Ignore this message. Something went wrong with the server. We will send you another message soon.";
            }
        }

        /// <summary>
        /// Generates a random string of a specified length using predefined characters.
        /// The length of the generated string is determined by the <see cref="CODE_LENGTH"/> constant.
        /// </summary>
        /// <returns>A random string composed of uppercase letters, lowercase letters, and digits.</returns>
        public static string GenerateRandomString()
        {
            var stringBuilder = new StringBuilder(CODE_LENGTH);

            for (int i = 0; i < CODE_LENGTH; i++)
            {
                stringBuilder.Append(Chars[Random.Next(Chars.Length)]);
            }

            return stringBuilder.ToString();
        }

        /// <summary>
        /// Validates the fields of a <see cref="Client"/> object.
        /// Performs checks on the following fields:
        /// <list type="bullet">
        /// <item><description><see cref="Client.Name"/> must not be null or empty.</description></item>
        /// <item><description><see cref="Client.Email"/> must be a valid email address.</description></item>
        /// <item><description><see cref="Client.Religion"/> must be within the range of 0 to 4.</description></item>
        /// <item><description><see cref="Client.HashedPassword"/> must be a valid password as per the validation rules.</description></item>
        /// <item><description><see cref="Client.AllergicTo"/> must not be null or empty.</description></item>
        /// </list>
        /// If any of the checks fail, the <paramref name="c"/> object is set to null.
        /// Logs errors if exceptions occur during validation.
        /// </summary>
        /// <param name="c">The <see cref="Client"/> object to validate.</param>
        /// <returns>A <see cref="Response{Client}"/> object containing the validated <see cref="Client"/> object 
        /// (or null if validation fails) and a <see cref="ResponseMessage"/> indicating the validation result.</returns>

        public static Response<Client> CheckFileds(Client c)
        {

            Client? data = c;
            try
            {
                if (c == null) data = null;
                else
                {
                    if (string.IsNullOrEmpty(c.Name)) data = null;
                    if (!IsEmailValid(c.Email)) data = null;
                    if (c.Religion < 0 || c.Religion > 4) data = null;
                    if (!IsPasswordValid(c.HashedPassword)) data = null;
                }

            }
            catch (Exception ex)
            {
                OurLogger logger = OurLogger.Instance;
                logger.LogError("Error in the server to handdel the checking password - " + ex);
            }
            return new Response<Client>()
            {
                Data = data,
                Message = new ResponseMessage(data == null ? 1 : 0, data == null ? "Check the validation of fields" : "Fileds are valid")
            };
        }

        public static Response<Client> CheckFiledsForUpadtae(Client c)
        {

            Client? data = c;
            try
            {
                if (c == null) data = null;
                else
                {
                    if (string.IsNullOrEmpty(c.Name)) data = null;
                    if (!IsEmailValid(c.Email)) data = null;
                    if (c.Religion < 0 || c.Religion > 4) data = null;
                }

            }
            catch (Exception ex)
            {
                OurLogger logger = OurLogger.Instance;
                logger.LogError("Error in the server to handdel the checking password - " + ex);
            }
            return new Response<Client>()
            {
                Data = data,
                Message = new ResponseMessage(data == null ? 1 : 0, data == null ? "Check the validation of fields" : "Fileds are valid")
            };
        }


        /// <summary>
        /// Validates the email address using the <see cref="System.Net.Mail.MailAddress"/> class instead of regex.
        /// This approach is preferred for its robustness in handling edge cases, prioritizing quality over speed.
        /// </summary>
        /// <param name="email">The user email address.</param>
        /// <returns>True if the email address is valid; otherwise, false.</returns>
        private static bool IsEmailValid(string email)
        {
            var valid = true;

            try
            {
                var emailAddress = new MailAddress(email);
            }
            catch
            {
                valid = false;
            }

            return valid;
        }

        /// <summary>
        /// Validates the given password based on the following criteria:
        /// <list type="number">
        /// <item><description>Minimum length of 5 characters</description></item>
        /// <item><description>At least one uppercase letter</description></item>
        /// <item><description>At least one lowercase letter</description></item>
        /// <item><description>No spaces allowed</description></item>
        /// <item><description>At least one special character</description></item>
        /// </list>
        /// </summary>
        /// <param name="password">The user password (not hashed)</param>
        /// <returns>True if the password meets all criteria; otherwise, false.</returns>
        public static bool IsPasswordValid(string password)
        {
            if (string.IsNullOrEmpty(password)) return false;

            if (password.Length < 5) return false;
            if (!password.Any(char.IsUpper)) return false;
            if (!password.Any(char.IsLower)) return false;
            if (password.Contains(" ")) return false;
            if (!ContainsOneSpecialCharcter(password)) return false;

            return true;
        }

        /// <summary>
        /// Checks if the password contains at least one special character.
        /// </summary>
        /// <param name="password">The user password (not hashed).</param>
        /// <returns>True if the password contains at least one special character; otherwise, false.</returns>
        private static bool ContainsOneSpecialCharcter(string password)
        {
            string specialChars = @"%!@#$%^&*()?/>.<,:;'\|}]{[_~`+=-" + "\"";
            return password.Any(ch => specialChars.Contains(ch));
        }

    }
}
