using Microsoft.AspNetCore.Mvc;
using CremealServer.Models.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.Data.SqlClient;
using CremealServer.Models.Requests;
using Google.Apis.Auth;
using CremealServer.Models;
using CremealServer.Models.DAL;
using Stripe;
using CremealServer.Models.Responses;

namespace CremealServer.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "User,Admin")]
    public class UserController : Controller
    {
        private readonly OurLogger logger = OurLogger.Instance;
        private readonly IEmailSender _emailSender;
        private readonly IPasswordHasher _passwordHasher;
        private readonly AccessTokenGenerator _tokenGenerator;
        private readonly IConfiguration _configuration;

        public UserController(IEmailSender emailSender, IPasswordHasher passwordHasser, AccessTokenGenerator accessTokenGenerator, IConfiguration configuration)
        {
            _emailSender = emailSender;
            _passwordHasher = passwordHasser;
            _tokenGenerator = accessTokenGenerator;
            _configuration = configuration;
        }


        /// <summary>
        /// Registers a new user with the provided client details.
        /// </summary>
        /// <param name="user">The client object containing user registration details.</param>
        /// <returns>An IActionResult indicating the result of the registration attempt.</returns>
        /// <response code="200">Returns a success message if registration is successful.</response>
        /// <response code="400">Returns an error message if there are validation issues or registration fails.</response>
        /// <response code="500">Returns a server error message if an internal server error occurs.</response>
        [HttpPost]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ObjectResult RegisterUser([FromBody] Client user)
        {
            try
            {
                Response<Client> fieldCheckResponse = Helpers.CheckFileds(user);
                if (fieldCheckResponse.Message.Status == 1)
                {
                    logger.LogWarning("False attempt to register - " + fieldCheckResponse.Message.Message);
                    return BadRequest(fieldCheckResponse.Message.Message);
                }

                user.HashedPassword = _passwordHasher.Hash(user.HashedPassword);
                Response<Int32> signUpResponse = user.SignUp();
                if (signUpResponse.Message.Status == 1)
                {
                    logger.LogWarning("Failed to register user - " + signUpResponse.Message.Message);
                    return BadRequest(signUpResponse.Message.Message);
                }

                return Ok(signUpResponse.Message.Message);
            }
            catch (SqlException ex)
            {
                logger.LogError("Database error occurred during user registration - " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, "A database error occurred. Please try again later.");
            }
            catch (Exception ex)
            {
                logger.LogError("An error occurred during user registration - " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal server error occurred. Please try again later.");
            }
        }

        /// <summary>
        /// Authenticates a user based on provided login credentials.
        /// </summary>
        /// <param name="request">The user request object containing email and password for authentication.</param>
        /// <returns>An ActionResult containing the authenticated client information or an error message.</returns>
        /// <response code="200">Returns the authenticated client details with a JWT token if login is successful.</response>
        /// <response code="400">Returns an error message if the request is null, email or password is missing, or authentication fails.</response>
        /// <response code="500">Returns a server error message if an internal error occurs during login processing.</response>
        [HttpPost]
        [Route("loginUser")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<ClientDTO> LoginUser([FromBody] UserRequest request)
        {

            if (request == null)
            {
                return BadRequest("Request cannot be null.");
            }

            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Email and password are required.");
            }

            try
            {
                string databaseHashedPassword = null;
                int? userId = null;

                ClientDTO client = Client.SignIn(request.Email, out databaseHashedPassword, out userId);

                if (client == null)
                {
                    logger.LogWarning("Trace the error for the GetUserByEmail function");
                    return BadRequest("Something went wrong no user retuerned");
                }

                bool isPasswordValid = _passwordHasher.Verify(databaseHashedPassword, request.Password);
                if (!isPasswordValid)
                {
                    logger.LogWarning($"Attempt to login with wrong password for the email {request.Email}");
                    return BadRequest("Something went wrong no user retuerned");
                }

                client.JWTToken = _tokenGenerator.GenerateToken(client, userId);
                logger.LogWarning($"The user goes by email \"{request.Email}\" is loged in succesfuly");
                return Ok(client);
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"An error occurred while logging in: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal error occurred. Please try again later.");
            }
        }

        /// <summary>
        /// Logs in a user using Google authentication. If the user is not already registered, they will be automatically registered.
        /// </summary>
        /// <param name="request">The <see cref="GoogleLoginRequest"/> containing the user's Google ID token.</param>
        /// <returns>
        /// An <see cref="ActionResult{ClientDTO}"/> containing the user's information and JWT token if successful.
        /// Returns a 200 OK status with the user data on success, a 400 Bad Request status if the request or token is invalid,
        /// or a 500 Internal Server Error status if an error occurs during processing.
        /// </returns>
        /// <exception cref="Exception">Thrown when an error occurs while registering the user or during login.</exception>
        /// <response code="200">User successfully logged in.</response>
        /// <response code="400">The request or token is invalid.</response>
        /// <response code="500">An internal error occurred.</response>
        /// <remarks>
        /// This method validates the Google ID token, checks if the user is already registered, and logs them in. 
        /// If the user is not found, they are registered, and a password is generated for them.
        /// </remarks>
        [HttpPost]
        [Route("loginWithGoogle")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public  ActionResult<Object> LoginWithGoogle([FromBody] GoogleLoginRequest request)
        {

            if (request == null)
            {
                return BadRequest("Request cannot be null.");
            }

            if (string.IsNullOrEmpty(request.IdToken))
            {
                return BadRequest("Token required");
            }

            try
            {
                string databaseHashedPassword = null;
                int? userId = null;


                var payload = GoogleJsonWebSignature.ValidateAsync(request.IdToken).GetAwaiter().GetResult();
                bool signedFirstTime = false;
                ClientDTO? user = Client.SignIn(payload.Email, out databaseHashedPassword, out userId);
                if(user == null)
                {
                    signedFirstTime = true;
                    Client c = new Client()
                    {
                        Name = payload.Name,
                        Email = payload.Email,
                        HashedPassword = PasswordGenerator.GeneratePassword(20),
                        AllergicTo = "",
                        Religion = 1,
                    };
                    var response = RegisterUser(c);
                    if(response.StatusCode != 200)
                    {
                        throw new Exception("Erorr while registering the user");
                    }
                    user = Client.SignIn(payload.Email, out databaseHashedPassword, out userId);
                    if (user == null)
                    {
                        logger.LogWarning("Trace the error for the LoginWithGoogle function");
                        return BadRequest("Something went wrong no user retuerned");
                    }
                    _emailSender.Send(c.Email, "Cremeal Application Login with google",
                                 Helpers.ReadHtmlTemplate("loginWithGoogle", c.Email, null));
                }

                user.JWTToken = _tokenGenerator.GenerateToken(user, userId);
                logger.LogInfo($"User has sign in using google account {user.Email}");
                return Ok( new { user, signedFirstTime } );

            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"An error occurred while logging in: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal error occurred. Please try again later.");
            }
        }

        /// <summary>
        /// Initiates a password reset process by generating a reset code and sending it to the specified email address.
        /// </summary>
        /// <param name="email">The email address of the user requesting a password reset.</param>
        /// <returns>An ActionResult containing the user ID if successful or an error message.</returns>
        /// <response code="200">Returns the user ID if the password reset code is generated and the email is sent successfully.</response>
        /// <response code="400">Returns an error message if the reset code cannot be generated or if any other error occurs.</response>
        [HttpGet]
        [HttpGet]
        [Route("resetPassword/email")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public ActionResult<int> ResetPassword(string email)
        {
            try
            {

                int userId;
                string code = Client.GetGeneratedCode(email, out userId);

                if (string.IsNullOrEmpty(code))
                {
                    return BadRequest("Unable to generate reset code. Please try again later.");
                }

                _emailSender.Send(email, "Cremeal Application Password Reset",
                                  Helpers.ReadHtmlTemplate("forgetPasswordTemplate", email, code));

                return Ok(userId);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex.Message);  
                return BadRequest("An error occurred while processing your request. Please try again later.");
            }
        }


        /// <summary>
        /// Verifies the password reset code for a given user.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose reset code is being verified.</param>
        /// <param name="code">The reset code that is being verified.</param>
        /// <returns>An ActionResult indicating whether the verification was successful or an error message.</returns>
        /// <response code="200">Returns a success response if the reset code is verified successfully.</response>
        /// <response code="400">Returns an error message if the reset code verification fails or an exception occurs.</response>
        [HttpPost]
        [Route("verfieCode/userId/code")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public ActionResult VerfieCode(int userId, string code)
        {
            try
            {
                return Ok(Client.VerifyResetCode(userId, code));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Resets the password for a given user by verifying and updating it with a new password.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose password is being reset.</param>
        /// <param name="newPassword">The new password to set for the user.</param>
        /// <returns>An ActionResult indicating the result of the password reset attempt.</returns>
        /// <response code="200">Returns a success response if the password is reset successfully.</response>
        /// <response code="400">Returns an error message if the new password is invalid or if any other error occurs.</response>
        [HttpPut]
        [AllowAnonymous]
        [Route("verfieCode/userId/newPassword")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public ActionResult ResetPassword(int userId, string newPassword)
        {
            try
            {
                bool fieldCheckResponse = Helpers.IsPasswordValid(newPassword);
                if (!fieldCheckResponse)
                {
                    logger.LogWarning("False attempt to reset password the password is not valid");
                    return BadRequest("False attempt to reset password the password is not valid");
                }

                newPassword = _passwordHasher.Hash(newPassword);
                return Ok(Client.ResetPassword(userId, newPassword));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        /// <summary>
        /// Updates the information of a client based on the provided details.
        /// </summary>
        /// <param name="client">The client object containing the updated information.</param>
        /// <returns>An ActionResult indicating the result of the update attempt.</returns>
        /// <response code="200">Returns a success response if the client information is updated successfully.</response>
        /// <response code="400">Returns an error message if the client information is invalid or if an exception occurs.</response>
        [HttpPut]
        [Route("updateUserImformation")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public ActionResult UpdateInformation([FromBody] Client client)
        {
            try
            {
                int userId = Convert.ToInt32(HttpContext.User.FindFirstValue("id"));
                client.UserId = userId;

                Response<Client> fieldCheckResponse = Helpers.CheckFiledsForUpadtae(client);
                if (fieldCheckResponse.Message.Status == 1)
                {
                    logger.LogWarning("False attempt to updateInformation - " + fieldCheckResponse.Message.Message);
                    return BadRequest(fieldCheckResponse.Message.Message);
                }
                return Ok(client.UpdateInformation());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Uploads and processes a profile image for the currently authenticated user.
        /// </summary>
        /// <param name="uploadFile">The image file to be uploaded and processed.</param>
        /// <returns>An IActionResult indicating the result of the upload attempt.</returns>
        /// <response code="200">Returns a success message if the image is uploaded and processed successfully.</response>
        /// <response code="400">Returns an error message if no file is uploaded or if the image format is unsupported.</response>
        /// <response code="500">Returns a server error message if an exception occurs during the upload and processing.</response>
        [HttpPut("uploadProfileImage")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UploadProfileImage(IFormFile uploadFile)
        {
            string email = HttpContext.User.FindFirstValue(ClaimTypes.Email);
            if (uploadFile == null || uploadFile.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                using (var stream = new MemoryStream())
                {
                    await uploadFile.CopyToAsync(stream);
                    stream.Seek(0, SeekOrigin.Begin);

                    using (var img = System.Drawing.Image.FromStream(stream))
                    {
                        // Validate image format
                        if (img.RawFormat.Equals(System.Drawing.Imaging.ImageFormat.Jpeg) ||
                            img.RawFormat.Equals(System.Drawing.Imaging.ImageFormat.Png) ||
                            img.RawFormat.Equals(System.Drawing.Imaging.ImageFormat.Gif))
                        {
                            int width = 100;
                            int height = 100;

                            using (var resizedImage = img.GetThumbnailImage(width, height, null, IntPtr.Zero))
                            {
                                string path = Directory.GetCurrentDirectory();
                                var fileName = $"{email}.jpg"; 
                                var filePath = Path.Combine(path, "Images/UsersImages/", fileName);

                                using (var output = new MemoryStream())
                                {
                                    resizedImage.Save(output, System.Drawing.Imaging.ImageFormat.Jpeg);
                                    await System.IO.File.WriteAllBytesAsync(filePath, output.ToArray());
                                }

                                return Ok("Uploaded successfully.");
                            }
                        }
                        else
                        {
                            return BadRequest("Unsupported image format. Please upload a JPEG, PNG, or GIF image.");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"Error in UploadProfileImage: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Deletes the profile image of the currently authenticated user.
        /// </summary>
        /// <returns>An IActionResult indicating the result of the deletion attempt.</returns>
        /// <response code="200">Returns a success message if the profile image is deleted successfully.</response>
        /// <response code="400">Returns an error message if the email is invalid, the default profile image cannot be deleted, or the profile image is not found.</response>
        /// <response code="500">Returns a server error message if an exception occurs during the deletion process.</response>
        [HttpDelete("removeProfileImage")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> DeleteProfileImage()
        {
            string email = HttpContext.User.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest("Invalid email address.");
            }

            try
            {
                // Check if the file name is 'default'
                if (email.Equals("default.png", StringComparison.OrdinalIgnoreCase) ||
                    email.Equals("default", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest("Default profile image cannot be deleted.");
                }

                string path = Directory.GetCurrentDirectory();
                var fileName = $"{email}.jpg";
                var filePath = Path.Combine(path, "Images/UsersImages/", fileName);

                if (System.IO.File.Exists(filePath))
                {
                    await Task.Run(() => System.IO.File.Delete(filePath));
                    return Ok("Profile image deleted successfully.");
                }
                else
                {
                    return BadRequest("Profile image not found.");
                }
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"Error deleting profile image: {ex.Message}");
                return StatusCode(500, "An error occurred while deleting the profile image.");
            }
        }

        /// <summary>
        /// Retrieves the filename of the profile image for the currently authenticated user.
        /// </summary>
        /// <returns>An IActionResult containing the filename of the profile image or a default image if none exists.</returns>
        /// <response code="200">Returns the filename of the user's profile image if it exists, or the default image filename if it does not.</response>
        /// <response code="400">Returns an error message if the email address is invalid.</response>
        /// <response code="500">Returns a server error message if an exception occurs during the retrieval process.</response>
        [HttpGet("GetImage")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public IActionResult GetProfileImage()
        {
            string email = HttpContext.User.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest("Invalid email address.");
            }

            try
            {
                string path = Directory.GetCurrentDirectory();
                var fileName = $"{email}.jpg";
                var filePath = Path.Combine(path, "Images/UsersImages", fileName);

                if (System.IO.File.Exists(filePath))
                {
                    return Ok(fileName);
                }
                else
                {
                    return Ok("default.png");
                }
            }
            catch (Exception ex)
            {
                // Log the exception for further analysis
                OurLogger.Instance.LogError($"Error retrieving profile image for email {email}: {ex.Message}");
                return StatusCode(500, "An error occurred while retrieving the profile image.");
            }
        }

        /// <summary>
        /// Processes a payment for a specified plan using the provided payment details. The user is identified via claims in the HTTP context.
        /// </summary>
        /// <param name="request">The <see cref="PaymentRequest"/> containing payment details such as plan ID, amount, currency, email, and payment method ID.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating the result of the payment process. Returns a 200 OK status with payment details on success,
        /// a 400 Bad Request status if any of the input parameters are invalid or missing, or a 500 Internal Server Error status if an error occurs during processing.
        /// </returns>
        /// <response code="200">Payment successfully processed and plan updated.</response>
        /// <response code="400">The request parameters are invalid or payment failed.</response>
        /// <response code="500">An internal error occurred during payment processing.</response>
        /// <remarks>
        /// This method validates the input request, creates a payment intent using Stripe's API, and updates the user's plan upon successful payment.
        /// It logs various stages of processing for debugging and auditing purposes, handles exceptions related to Stripe and general payment processing errors,
        /// and ensures that the payment intent is automatically confirmed without handling redirects.
        /// </remarks>
        [HttpPut("PayForPlan")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> PayForPlan([FromBody] PaymentRequest request)
        {
            if (request == null)
            {
                OurLogger.Instance.LogWarning("Received null request in PayForPlan.");
                return BadRequest("Request should not be null.");
            }

            if (request.PlanId <= 0)
            {
                OurLogger.Instance.LogWarning("Invalid plan ID in PayForPlan: " + request.PlanId);
                return BadRequest("Invalid plan ID.");
            }

            if (string.IsNullOrEmpty(request.Currency))
            {
                OurLogger.Instance.LogWarning("Invalid currency in PayForPlan: " + request.Currency);
                return BadRequest("Currency is required.");
            }

            if (string.IsNullOrEmpty(request.Email))
            {
                OurLogger.Instance.LogWarning("Invalid email in PayForPlan: " + request.Email);
                return BadRequest("Email is required.");
            }

            if (request.Amount <= 0)
            {
                OurLogger.Instance.LogWarning("Invalid amount in PayForPlan: " + request.Amount);
                return BadRequest("Amount must be greater than zero.");
            }

            if (string.IsNullOrEmpty(request.PaymentMethodId))
            {
                OurLogger.Instance.LogWarning("Payment method ID is missing in PayForPlan.");
                return BadRequest("Payment method ID is required.");
            }

            int userId;
            try
            {
                userId = Convert.ToInt32(HttpContext.User.FindFirstValue("id"));
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"Error retrieving user ID from claims: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving user information.");
            }

            try
            {
                OurLogger.Instance.LogInfo($"Creating payment intent for user ID {userId} and plan ID {request.PlanId}.");

                var options = new PaymentIntentCreateOptions
                {
                    Amount = request.Amount,
                    Currency = request.Currency,
                    PaymentMethod = request.PaymentMethodId,
                    ReceiptEmail = request.Email,
                    Description = request.Description, 
                    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                    {
                        Enabled = true,
                        AllowRedirects = "never" // Do not handle redirects
                    },
                    Confirm = true // Automatic confirmation
                };

                var service = new PaymentIntentService();
                PaymentIntent paymentIntent = await service.CreateAsync(options);

                if (paymentIntent.Status == "succeeded")
                {
                    OurLogger.Instance.LogInfo($"Payment successful for user ID {userId} and plan ID {request.PlanId}.");
                    var result = Client.PayForPlan(userId, request.PlanId);
                    var transaction_insert_result = Transaction.Insert(request, userId);
                    return Ok(new
                    {
                        Status = "success",
                        PaymentIntentId = paymentIntent.Id,
                        Result = result + ", "+ transaction_insert_result
                    });
                }
                else
                {
                    OurLogger.Instance.LogInfo($"Payment not successful for user ID {userId} and plan ID {request.PlanId}. Status: {paymentIntent.Status}");
                    return BadRequest(new { Status = "failure", Message = "Payment not successful." });
                }
            }
            catch (StripeException e)
            {
                OurLogger.Instance.LogError($"Stripe error: {e.StripeError.Message}. Request details: {request}");
                return BadRequest(new { Error = e.StripeError.Message });
            }
            catch (InvalidOperationException ex)
            {
                OurLogger.Instance.LogError($"Payment processing failed: {ex.Message}. Request details: {request}");
                return BadRequest(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"Unexpected error in PayForPlan: {ex.Message}. Request details: {request}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing the payment.");
            }
        }

        /// <summary>
        /// Retrieves the details of the currently authenticated user, including their religion and allergens.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing the user details if the retrieval is successful, or an appropriate error message.
        /// </returns>
        /// <response code="200">Returns the user details if retrieval is successful.</response>
        /// <response code="400">Returns an error message if the user ID is invalid.</response>
        /// <response code="404">Returns a not found message if no details are found for the user.</response>
        /// <response code="500">Returns a server error message if an internal server error occurs during the retrieval process.</response>
        [HttpGet("GetUserRligonAndAlergens")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult GetUserRligonAndAlergens()
        {
            OurLogger logger = OurLogger.Instance;

            int userId;
            try
            {
                userId = Convert.ToInt32(HttpContext.User.FindFirstValue("id"));

                if (userId <= 0)
                {
                    logger.LogWarning($"Invalid user ID retrieved from claims: {userId}");
                    return BadRequest("Invalid user ID.");
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Error retrieving user ID from claims: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving user ID.");
            }

            try
            {
                var result = Client.GetUserRligonAndAlergens(userId);

                if (result == null)
                {
                    logger.LogInfo($"No details found for user ID: {userId}");
                    return NotFound("User details not found.");
                }

                logger.LogInfo($"Successfully retrieved details for user ID: {userId}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError($"An error occurred while retrieving details for user ID: {userId} - Exception: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving user details.");
            }
        }



    }
}
