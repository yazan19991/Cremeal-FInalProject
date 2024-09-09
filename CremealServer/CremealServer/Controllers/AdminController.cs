using CremealServer.Models;
using CremealServer.Models.ConfigureOptions;
using CremealServer.Models.DAL;
using CremealServer.Models.Requests;
using CremealServer.Models.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace CremealServer.Controllers
{


    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,User")]

    public class AdminController : Controller
    {

        private readonly AdminConfiguration _adminConfg;
        private readonly AccessTokenGenerator _tokenGenerator;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IEmailSender _emailSender;

        public AdminController(IOptions<AdminConfiguration> ac, AccessTokenGenerator accessTokenGenerator, IPasswordHasher passwordHasser, IEmailSender emailSender)
        {
            _emailSender = emailSender;
            _tokenGenerator = accessTokenGenerator;
            _adminConfg = ac.Value;
            _passwordHasher = passwordHasser;

        }


        // KhaledIsTheBest2000
        [HttpPost("AdminSignIn")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult SignIn([FromBody] AdminSignInRequest request)
        {
            OurLogger logger = OurLogger.Instance;

            try
            {

                logger.LogInfo("Admin sign-in attempt started.");

                if (_passwordHasher.Verify(_adminConfg.Password, request.Password))
                {
                    logger.LogInfo("Admin credentials verified successfully.");
                    string token = _tokenGenerator.GenerateTokenAdmin();
                    logger.LogInfo("Token generated successfully.");
                    return Ok(token);
                }

                logger.LogWarning("Admin sign-in failed due to wrong credentials.");
                return BadRequest("Wrong credentials.");
            }
            catch (Exception ex)
            {
                logger.LogError($"Admin sign-in failed: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred during the sign-in process.");
            }
        }

        /// <summary>
        /// Retrieves the information of all users from the database.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing the list of users on success, or an error message on failure.
        /// </returns>
        /// <response code="200">Returns the list of users.</response>
        /// <response code="500">An internal error occurred while retrieving users.</response>
        [HttpGet("GetAllUsers")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult GetAllUsers()
        {
            var logger = OurLogger.Instance;

            try
            {
                logger.LogInfo("Retrieving all users from the database.");
                GeneralDBservices dbs = new GeneralDBservices();
                var users = dbs.GetAllUsersInfo();
                return Ok(users);
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in GetAllUsers: {sqlEx.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving users from the database.");
            }
            catch (Exception ex)
            {
                logger.LogError($"Unexpected error in GetAllUsers: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal error occurred while retrieving users.");
            }
        }



        /// <summary>
        /// Retrieves all transactions from the system.
        /// </summary>
        /// <returns>An <see cref="IActionResult"/> containing the list of transactions if retrieval is successful, or an appropriate error message.</returns>
        /// <response code="200">Returns the list of transactions if retrieval is successful.</response>
        /// <response code="500">Returns a server error message if an internal server error occurs.</response>
        [HttpGet("GetAllTransactions")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult GetAllTransactions()
        {
            try
            {
                var transactions = Transaction.GetAll();
                if (transactions == null )
                {
                    OurLogger.Instance.LogInfo("No transactions found in the system.");
                    return NotFound("No transactions found.");
                }

                OurLogger.Instance.LogInfo("Successfully retrieved list of transactions.");
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"Error in GetAllTransactions: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving transactions.");
            }
        }

        /// <summary>
        /// Retrieves the information of all meals from the database.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing the list of meals on success, or an error message on failure.
        /// </returns>
        /// <response code="200">Returns the list of meals.</response>
        /// <response code="500">An internal error occurred while retrieving meals.</response>
        [HttpGet("GetAllMeals")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult GetAllMeals()
        {
            var logger = OurLogger.Instance;

            try
            {
                logger.LogInfo("Retrieving all meals from the database.");
                GeneralDBservices dbs = new GeneralDBservices();
                var Response_meals = dbs.GetAllMeals();
                return Ok(Response_meals);
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in GetAllMeals: {sqlEx.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving meals from the database.");
            }
            catch (Exception ex)
            {
                logger.LogError($"Unexpected error in GetAllMeals: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal error occurred while retrieving meals.");
            }
        }


        /// <summary>
        /// Retrieves the information of all plans from the database. This endpoint is accessible by users with 'User' or 'Admin' roles.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing the list of plans on success, or an error message on failure.
        /// </returns>
        /// <response code="200">Returns the list of plans.</response>
        /// <response code="403">Access is forbidden for users without the required roles.</response>
        /// <response code="500">An internal error occurred while retrieving plans.</response>
        [HttpGet("GetAllPlans")]
        [Authorize(Roles = "User,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult GetAllPlans()
        {
            var logger = OurLogger.Instance;

            try
            {
                logger.LogInfo("Retrieving all plans from the database.");

                GeneralDBservices dbs = new GeneralDBservices();
                var plans = dbs.GetAllPlans();
                return Ok(plans);
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in GetAllPlans: {sqlEx.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving plans from the database.");
            }
            catch (Exception ex)
            {
                logger.LogError($"Unexpected error in GetAllPlans: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal error occurred while retrieving plans.");
            }
        }


        /// <summary>
        /// Retrieves the information of all religions from the database.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing the list of religions on success, or an error message on failure.
        /// </returns>
        /// <response code="200">Returns the list of religions.</response>
        /// <response code="500">An internal error occurred while retrieving religions.</response>
        [HttpGet("GetAllReligions")]
        [Authorize(Roles = "User,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult GetAllReligions()
        {
            var logger = OurLogger.Instance;

            try
            {
                logger.LogInfo("Retrieving all religions from the database.");

                GeneralDBservices dbs = new GeneralDBservices();
                var religions = dbs.GetAllReligions();
                return Ok(religions);
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in GetAllReligions: {sqlEx.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving religions from the database.");
            }
            catch (Exception ex)
            {
                logger.LogError($"Unexpected error in GetAllReligions: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal error occurred while retrieving religions.");
            }
        }


        /// <summary>
        /// Retrieves the information of all allergics from the database.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing the list of allergics on success, or an error message on failure.
        /// </returns>
        /// <response code="200">Returns the list of allergics.</response>
        /// <response code="500">An internal error occurred while retrieving allergics.</response>
        [HttpGet("GetAllAllergics")]
        [Authorize(Roles = "User,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult GetAllAllergics()
        {
            var logger = OurLogger.Instance;

            try
            {
                logger.LogInfo("Retrieving all allergics from the database.");
                GeneralDBservices dbs = new GeneralDBservices();
                var allergics = dbs.GetAllAllergics();

                if (allergics.Message.Status == 0)
                {
                    logger.LogInfo($"Successfully retrieved all allergics. Status: {0}, Message: {allergics.Message.Message}");
                    return Ok(allergics);
                }
                else
                {
                    logger.LogWarning($"Failed to retrieve allergics. StatusMessage: {allergics.Message.Message}");
                    return StatusCode(StatusCodes.Status500InternalServerError, allergics.Message.Message);
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in GetAllAllergics: {sqlEx.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving allergics from the database.");
            }
            catch (Exception ex)
            {
                logger.LogError($"Unexpected error in GetAllAllergics: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal error occurred while retrieving allergics.");
            }
        }


        /// <summary>
        /// Retrieves the information of all statistics from the database.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing the list of statistics on success, or an error message on failure.
        /// </returns>
        /// <response code="200">Returns the list of statistics.</response>
        /// <response code="500">An internal error occurred while retrieving statistics.</response>
        [HttpGet("GetAllStatistics")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult GetAllStatistics()
        {
            var logger = OurLogger.Instance;

            try
            {
                logger.LogInfo("Retrieving all statistics from the database.");

                GeneralDBservices dbs = new GeneralDBservices();
                var statistics = dbs.GetStatisticsInfo();
                return Ok(statistics);
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in GetAllStatistics: {sqlEx.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving statistics from the database.");
            }
            catch (Exception ex)
            {
                logger.LogError($"Unexpected error in GetAllStatistics: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal error occurred while retrieving statistics.");
            }
        }

        /// <summary>
        /// Inserts a new allergen into the database.
        /// </summary>
        /// <param name="allergenLabel">The label of the allergen to be inserted.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating the result of the insert operation.
        /// </returns>
        /// <response code="200">The allergen was successfully inserted.</response>
        /// <response code="400">The request parameters are invalid or the allergen could not be inserted.</response>
        /// <response code="500">An internal error occurred while inserting the allergen.</response>
        [HttpPost("InsertNewAllergen")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult InsertNewAllergen([FromHeader] string allergenLabel)
        {
            var logger = OurLogger.Instance;

            if (string.IsNullOrWhiteSpace(allergenLabel))
            {
                logger.LogWarning("Received invalid allergen label: null or empty.");
                return BadRequest("Allergen label must not be null or empty.");
            }

            try
            {
                logger.LogInfo($"Inserting new allergen with label: {allergenLabel}.");

                GeneralDBservices dbs = new GeneralDBservices();
                var result = dbs.InsertNewAllergen(allergenLabel);

                if (result.Message.Status == 0)
                {
                    logger.LogInfo($"Successfully inserted allergen with label: {allergenLabel}.");
                    return Ok(result.Message.Message);
                }
                else
                {
                    logger.LogWarning($"Failed to insert allergen with label: {allergenLabel}. Result code: {result}");
                    return BadRequest(result.Message.Message);
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in InsertNewAllergen: {sqlEx.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while inserting the allergen into the database.");
            }
            catch (Exception ex)
            {
                logger.LogError($"Unexpected error in InsertNewAllergen: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal error occurred while inserting the allergen.");
            }
        }

        /// <summary>
        /// Inserts a new religion into the database.
        /// </summary>
        /// <param name="religionTitle">The title of the religion to be inserted.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating the result of the insert operation.
        /// </returns>
        /// <response code="200">The religion was successfully inserted.</response>
        /// <response code="400">The request parameters are invalid or the religion could not be inserted.</response>
        /// <response code="500">An internal error occurred while inserting the religion.</response>
        [HttpPost("InsertNewReligion")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult InsertNewReligion([FromHeader] string religionTitle)
        {
            var logger = OurLogger.Instance;

            if (string.IsNullOrWhiteSpace(religionTitle))
            {
                logger.LogWarning("Received invalid religion title: null or empty.");
                return BadRequest("Religion title must not be null or empty.");
            }

            try
            {
                logger.LogInfo($"Inserting new religion with title: {religionTitle}.");

                GeneralDBservices dbs = new GeneralDBservices();
                var result = dbs.InsertNewReligion(religionTitle);

                if (result.Message.Status == 0)
                {
                    logger.LogInfo($"Successfully inserted religion with title: {religionTitle}.");
                    return Ok("Religion inserted successfully.");
                }
                else
                {
                    logger.LogWarning($"Failed to insert religion with title: {religionTitle}. Result code: {result}");
                    return BadRequest(result.Message.Message);
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in InsertNewReligion: {sqlEx.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while inserting the religion into the database.");
            }
            catch (Exception ex)
            {
                logger.LogError($"Unexpected error in InsertNewReligion: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal error occurred while inserting the religion.");
            }
        }

        /// <summary>
        /// Sends bulk emails to users based on the provided request.
        /// </summary>
        /// <param name="request">The <see cref="BulkEmailRequest"/> containing the email details and recipient information.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating the result of the email sending operation.
        /// </returns>
        /// <response code="200">The emails were successfully sent.</response>
        /// <response code="400">The request parameters are invalid or the email sending failed.</response>
        /// <response code="500">An internal error occurred while sending the emails.</response>
        [HttpPost("SendEmailToUsers")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult SendEmailToUsers([FromBody] BulkEmailRequest request)
        {
            var logger = OurLogger.Instance;

            if (request == null)
            {
                logger.LogWarning("Received null request in SendEmailToUsers.");
                return BadRequest("Request should not be null.");
            }

            if (request.Emails == null || !request.Emails.Any())
            {
                logger.LogWarning("No recipients specified in SendEmailToUsers.");
                return BadRequest("At least one recipient must be specified.");
            }

            if (string.IsNullOrEmpty(request.Subject))
            {
                logger.LogWarning("Subject is missing in SendEmailToUsers.");
                return BadRequest("Email subject is required.");
            }

            if (string.IsNullOrEmpty(request.Body))
            {
                logger.LogWarning("Email body is missing in SendEmailToUsers.");
                return BadRequest("Email body is required.");
            }

            try
            {
                logger.LogInfo($"Sending bulk email to {request.Emails.Count()} recipients.");

                _emailSender.SendBulkEmail(request);

                logger.LogInfo("Bulk email sent successfully.");
                return Ok("Emails sent successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError($"Error occurred while sending bulk emails: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while sending the emails.");
            }
        }

        /// <summary>
        /// Hashes the provided password using a password hashing service.
        /// </summary>
        /// <param name="password">The plain text password to be hashed.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> containing the hashed password.
        /// </returns>
        /// <response code="200">Password hashed successfully.</response>
        /// <response code="400">Invalid password or hashing failed.</response>
        /// <response code="500">An internal error occurred while hashing the password.</response>
        [HttpPost("HashPassword")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult HashPassword([FromHeader] string password)
        {
            var logger = OurLogger.Instance;

            // Validate the input
            if (string.IsNullOrEmpty(password))
            {
                logger.LogWarning("Received null or empty password for hashing.");
                return BadRequest("Password cannot be null or empty.");
            }

            try
            {
                logger.LogInfo("Hashing password.");

                var hashedPassword = _passwordHasher.Hash(password);

                if (string.IsNullOrEmpty(hashedPassword))
                {
                    logger.LogWarning("Password hashing resulted in an empty hash.");
                    return BadRequest("Failed to hash the password.");
                }

                logger.LogInfo("Password hashed successfully.");
                return Ok(hashedPassword);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error occurred while hashing password. Exception: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while hashing the password.");
            }
        }




        /// <summary>
        /// Updates the number of coins for a specified user.
        /// </summary>
        /// <param name="id">The ID of the user whose coins will be updated.</param>
        /// <param name="coins">The number of coins to set for the user. Should be a positive integer.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating the result of the update operation.
        /// </returns>
        /// <response code="200">User coins updated successfully.</response>
        /// <response code="400">Invalid request parameters, such as negative coin values.</response>
        /// <response code="500">An internal error occurred while updating the user's coins.</response>
        [HttpPut("UpdateUserCoins")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult UpdateUserCoins([FromHeader] int id, [FromHeader] int coins)
        {
            var logger = OurLogger.Instance;

            if (coins < 0)
            {
                logger.LogWarning($"Attempted to set negative coins value: {coins} for user ID: {id}.");
                return BadRequest("Coins should be a non-negative value.");
            }

            if (id <= 0)
            {
                logger.LogWarning($"Invalid user ID: {id} provided for updating coins.");
                return BadRequest("Invalid user ID.");
            }

            try
            {
                logger.LogInfo($"Updating coins for user ID: {id}. New coin value: {coins}.");

                GeneralDBservices dbs = new GeneralDBservices();
                var result = dbs.UpdateUserCoins(id, coins);

                if (result.Message.Status == 0)
                {
                    logger.LogInfo($"Successfully updated coins for user ID: {id}.");
                    return Ok("User coins updated successfully.");
                }
                else
                {
                    logger.LogWarning($"Failed to update coins for user ID: {id}. No changes were made.");
                    return BadRequest(result.Message.Message);

                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Error occurred while updating coins for user ID: {id}. Exception: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the user's coins.");
            }
        }

        /// <summary>
        /// Updates the details of a plan based on the provided request.
        /// </summary>
        /// <param name="request">The <see cref="PlanUpdateRequest"/> containing the details of the plan to be updated.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating the result of the update operation.
        /// </returns>
        /// <response code="200">Plan updated successfully.</response>
        /// <response code="400">Invalid request parameters or update failed.</response>
        /// <response code="500">An internal error occurred while updating the plan.</response>
        [HttpPut("UpdatePlan")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult UpdatePlan([FromBody] PlanUpdateRequest request)
        {
            var logger = OurLogger.Instance;

            // Validate the request
            if (request == null)
            {
                logger.LogWarning("Received null request in UpdatePlan.");
                return BadRequest("Request should not be null.");
            }

            if (request.Id <= 0)
            {
                logger.LogWarning($"Invalid plan ID in UpdatePlan: {request.Id}");
                return BadRequest("Invalid plan ID.");
            }

            if (string.IsNullOrEmpty(request.PlanTitle))
            {
                logger.LogWarning("Plan title is required in UpdatePlan.");
                return BadRequest("Plan title is required.");
            }

            if (request.CoinsAmount < 0)
            {
                logger.LogWarning($"Invalid coins amount in UpdatePlan: {request.CoinsAmount}");
                return BadRequest("Coins amount should be non-negative.");
            }

            if (request.Price < 0)
            {
                logger.LogWarning($"Invalid price in UpdatePlan: {request.Price}");
                return BadRequest("Price should be non-negative.");
            }

            try
            {
                logger.LogInfo($"Updating plan with ID: {request.Id}.");

                GeneralDBservices dbs = new GeneralDBservices();
                var result = dbs.UpdatePlan(request);

                if (result.Message.Status == 0)
                {
                    logger.LogInfo($"Successfully updated plan with ID: {request.Id}.");
                    return Ok("Plan updated successfully.");
                }
                else
                {
                    logger.LogWarning($"Failed to update plan with ID: {request.Id}. No changes were made.");
                    return BadRequest(result.Message.Message);

                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Error occurred while updating plan with ID: {request.Id}. Exception: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the plan.");
            }
        }


        /// <summary>
        /// Deletes a religion based on the provided religion ID.
        /// </summary>
        /// <param name="religionId">The ID of the religion to be deleted.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating the result of the delete operation.
        /// </returns>
        /// <response code="200">Religion deleted successfully.</response>
        /// <response code="400">Invalid religion ID or deletion failed.</response>
        /// <response code="500">An internal error occurred while deleting the religion.</response>
        [HttpDelete("DeleteReligion")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult DeleteReligion([FromHeader] int religionId)
        {
            var logger = OurLogger.Instance;

            // Validate the input
            if (religionId <= 0)
            {
                logger.LogWarning($"Invalid religion ID in DeleteReligion: {religionId}");
                return BadRequest("Invalid religion ID.");
            }

            try
            {
                logger.LogInfo($"Attempting to delete religion with ID: {religionId}.");

                GeneralDBservices dbs = new GeneralDBservices();
                var result = dbs.DeleteReligion(religionId);

                if (result.Message.Status == 0)
                {
                    logger.LogInfo($"Successfully deleted religion with ID: {religionId}.");
                    return Ok("Religion deleted successfully.");
                }
                else
                {
                    logger.LogWarning($"Failed to delete religion with ID: {religionId}. No changes were made.");
                    return BadRequest(result.Message.Message);
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Error occurred while deleting religion with ID: {religionId}. Exception: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the religion.");
            }
        }


        /// <summary>
        /// Deletes an allergen based on the provided allergen ID.
        /// </summary>
        /// <param name="allergenId">The ID of the allergen to be deleted.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating the result of the delete operation.
        /// </returns>
        /// <response code="200">Allergen deleted successfully.</response>
        /// <response code="400">Invalid allergen ID or deletion failed.</response>
        /// <response code="500">An internal error occurred while deleting the allergen.</response>
        [HttpDelete("DeleteAllergen")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult DeleteAllergen([FromHeader] int allergenId)
        {
            var logger = OurLogger.Instance;

            // Validate the input
            if (allergenId <= 0)
            {
                logger.LogWarning($"Invalid allergen ID in DeleteAllergen: {allergenId}");
                return BadRequest("Invalid allergen ID.");
            }

            try
            {
                logger.LogInfo($"Attempting to delete allergen with ID: {allergenId}.");

                GeneralDBservices dbs = new GeneralDBservices();
                var result = dbs.DeleteAllergen(allergenId);

                if (result.Message.Status == 0)
                {
                    logger.LogInfo($"Successfully deleted allergen with ID: {allergenId}.");
                    return Ok("Allergen deleted successfully.");
                }
                else
                {
                    logger.LogWarning($"Failed to delete allergen with ID: {allergenId}. No changes were made.");
                    return BadRequest(result.Message.Message);
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Error occurred while deleting allergen with ID: {allergenId}. Exception: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the allergen.");
            }
        }




        /// <summary>
        /// Deletes a user from the system and optionally removes their profile image from the server.
        /// </summary>
        /// <param name="request">The <see cref="DeleteUserRequest"/> containing the user ID and optional email for the profile image.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating the result of the delete operation. Returns a 200 OK status with the result of the delete operation,
        /// a 400 Bad Request status if the request is invalid or an error occurs, or a 500 Internal Server Error status for unexpected errors.
        /// </returns>
        /// <response code="200">User deleted successfully and profile image removed if applicable.</response>
        /// <response code="400">Invalid request parameters or failure to delete the user.</response>
        /// <response code="500">An internal error occurred while deleting the user or removing the profile image.</response>
        [HttpDelete("DeleteUser")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser([FromBody] DeleteUserRequest request)
        {
            var logger = OurLogger.Instance;

            // Validate the request
            if (request == null || request.UserId <= 0)
            {
                logger.LogWarning("Invalid request in DeleteUser: Request is null or UserId is invalid.");
                return BadRequest("Invalid request parameters.");
            }

            try
            {
                GeneralDBservices dbs = new GeneralDBservices();
                // Delete the user from the database
                logger.LogInfo($"Deleting user with ID {request.UserId}.");
                var response = dbs.DeleteUser(request.UserId);

                // Check if the user deletion was successful
                if (response.Message.Status == 0 && !string.IsNullOrEmpty(request.Email) &&
                    request.Email != "default.png" && request.Email != "default")
                {
                    string path = System.IO.Directory.GetCurrentDirectory();
                    string fileName = $"{request.Email}.jpg";
                    string filePath = Path.Combine(path, "Images/UsersImages", fileName);

                    // Remove the profile image if it exists
                    if (System.IO.File.Exists(filePath))
                    {
                        logger.LogInfo($"Deleting profile image at {filePath}.");
                        await Task.Run(() => System.IO.File.Delete(filePath));
                    }
                    else
                    {
                        logger.LogWarning($"Profile image not found at {filePath}.");
                    }
                }

                logger.LogInfo($"User with ID {request.UserId} deleted successfully.");
                return Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error occurred while deleting user: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing the request.");
            }
        }



    }
}
